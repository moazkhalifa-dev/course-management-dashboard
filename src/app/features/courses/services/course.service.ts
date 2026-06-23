import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Course,
  CreateCoursePayload,
  UpdateCoursePayload,
} from '../../../core/models/course.model';

/**
 * Owns all Course data access and the feature-level reactive state.
 *
 * Architecture rule: components never call HttpClient directly — they
 * delegate to this service. State is exposed as readonly signals so the
 * UI can react without manual subscriptions.
 */
@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/courses`;

  private readonly _courses = signal<Course[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly courses = this._courses.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isEmpty = computed(
    () => !this._loading() && !this._error() && this._courses().length === 0,
  );

  loadCourses(): void {
    this._loading.set(true);
    this._error.set(null);

    this.http.get<Course[]>(this.baseUrl).subscribe({
      next: (courses) => {
        this._courses.set(courses);
        this._loading.set(false);
      },
      error: () => {
        this._error.set('Something went wrong');
        this._loading.set(false);
      },
    });
  }

  getById(id: string): Observable<Course> {
    return this.http.get<Course>(`${this.baseUrl}/${id}`);
  }

  /**
   * Creates a new course with a frontend-generated sequential numeric id.
   *
   * The assignment uses numeric sequential ids, but json-server v1 would
   * otherwise assign random string ids. To match the sample data we fetch the
   * current courses, compute `max(numeric id) + 1`, and send that id with the
   * POST. String ids from older test records are ignored defensively when
   * computing the next id.
   */
  create(payload: CreateCoursePayload): Observable<Course> {
    return this.http.get<Course[]>(this.baseUrl).pipe(
      switchMap((courses) => {
        const id = this.getNextId(courses);
        return this.http.post<Course>(this.baseUrl, { ...payload, id });
      }),
      tap((created) => this._courses.update((list) => [...list, created])),
    );
  }

  /**
   * Computes the next sequential id: `max(numeric id) + 1`, or `1` when there
   * are no numeric ids. Non-numeric (string) ids are ignored so legacy test
   * records never break id generation.
   */
  private getNextId(courses: Course[]): string {
    const numericIds = courses.map((c) => Number(c.id)).filter((n) => Number.isInteger(n) && n > 0);
    const max = numericIds.length ? Math.max(...numericIds) : 0;
    return String(max + 1);
  }

  update(id: string, payload: UpdateCoursePayload): Observable<Course> {
    return this.http
      .put<Course>(`${this.baseUrl}/${id}`, { ...payload, id })
      .pipe(
        tap((updated) =>
          this._courses.update((list) => list.map((c) => (c.id === id ? updated : c))),
        ),
      );
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(tap(() => this._courses.update((list) => list.filter((c) => c.id !== id))));
  }
}
