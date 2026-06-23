import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Course } from '../../../../core/models/course.model';
import { PageStateComponent } from '../../../../shared/components/page-state/page-state.component';
import { StatusTagComponent } from '../../../../shared/components/status-tag/status-tag.component';
import { CourseService } from '../../services/course.service';

/**
 * Course details page (smart component).
 *
 * Loads a single course by the `:id` route param (bound as an input via
 * withComponentInputBinding) and delegates all data access to CourseService.
 * A 404 is treated as a "not found" empty state; other failures as an error
 * state — both rendered by PageStateComponent.
 */
@Component({
  selector: 'app-course-details',
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.scss',
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    CardModule,
    ButtonModule,
    PageStateComponent,
    StatusTagComponent,
  ],
})
export class CourseDetailsComponent {
  private readonly courseService = inject(CourseService);

  /** Route param `:id`, bound as a component input. */
  readonly id = input.required<string>();

  protected readonly course = signal<Course | null>(null);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);
  protected readonly notFound = signal<boolean>(false);

  protected readonly emptyMessage = computed(() =>
    this.notFound() ? `Course #${this.id()} was not found.` : 'No Courses Found',
  );

  constructor() {
    // Reload whenever the route id changes.
    effect(() => {
      const id = this.id();
      this.loadCourse(id);
    });
  }

  /** Loads the course via the service and maps the result to view state. */
  loadCourse(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.notFound.set(false);
    this.course.set(null);

    this.courseService.getById(id).subscribe({
      next: (course) => {
        this.course.set(course);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.notFound.set(true);
        } else {
          this.error.set('Something went wrong');
        }
        this.loading.set(false);
      },
    });
  }

  /** Retry handler for the error state. */
  retry(): void {
    this.loadCourse(this.id());
  }
}
