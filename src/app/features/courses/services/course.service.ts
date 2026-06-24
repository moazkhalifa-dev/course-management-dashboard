import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Course,
  CreateCoursePayload,
  UpdateCoursePayload,
} from '../../../core/models/course.model';
import { SEED_COURSES } from '../data/seed-courses';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/courses`;
  private readonly storageKey = 'course-management-dashboard-courses';

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

    if (environment.useLocalStorage) {
      const courses = this.getLocalCourses();
      this._courses.set(courses);
      this._loading.set(false);
      return;
    }

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
    if (environment.useLocalStorage) {
      const course = this.getLocalCourses().find((item) => item.id === id);

      if (!course) {
        return throwError(() => new Error('Course not found'));
      }

      return of(course);
    }

    return this.http.get<Course>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateCoursePayload): Observable<Course> {
    if (environment.useLocalStorage) {
      const courses = this.getLocalCourses();
      const created: Course = {
        ...payload,
        id: this.getNextId(courses),
      };

      const updatedCourses = [...courses, created];
      this.saveLocalCourses(updatedCourses);
      this._courses.set(updatedCourses);

      return of(created);
    }

    return this.http.get<Course[]>(this.baseUrl).pipe(
      switchMap((courses) => {
        const id = this.getNextId(courses);
        return this.http.post<Course>(this.baseUrl, { ...payload, id });
      }),
      tap((created) => this._courses.update((list) => [...list, created])),
    );
  }

  update(id: string, payload: UpdateCoursePayload): Observable<Course> {
    if (environment.useLocalStorage) {
      const courses = this.getLocalCourses();
      const exists = courses.some((course) => course.id === id);

      if (!exists) {
        return throwError(() => new Error('Course not found'));
      }

      const updated: Course = { ...payload, id };
      const updatedCourses = courses.map((course) => (course.id === id ? updated : course));

      this.saveLocalCourses(updatedCourses);
      this._courses.set(updatedCourses);

      return of(updated);
    }

    return this.http
      .put<Course>(`${this.baseUrl}/${id}`, { ...payload, id })
      .pipe(
        tap((updated) =>
          this._courses.update((list) => list.map((course) => (course.id === id ? updated : course))),
        ),
      );
  }

  delete(id: string): Observable<void> {
    if (environment.useLocalStorage) {
      const updatedCourses = this.getLocalCourses().filter((course) => course.id !== id);

      this.saveLocalCourses(updatedCourses);
      this._courses.set(updatedCourses);

      return of(void 0);
    }

    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(tap(() => this._courses.update((list) => list.filter((course) => course.id !== id))));
  }

  private getLocalCourses(): Course[] {
    const storedCourses = localStorage.getItem(this.storageKey);

    if (!storedCourses) {
      this.saveLocalCourses(SEED_COURSES);
      return [...SEED_COURSES];
    }

    try {
      return JSON.parse(storedCourses) as Course[];
    } catch {
      this.saveLocalCourses(SEED_COURSES);
      return [...SEED_COURSES];
    }
  }

  private saveLocalCourses(courses: Course[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(courses));
  }

  private getNextId(courses: Course[]): string {
    const numericIds = courses.map((course) => Number(course.id)).filter((id) => Number.isInteger(id) && id > 0);
    const max = numericIds.length ? Math.max(...numericIds) : 0;

    return String(max + 1);
  }
}
