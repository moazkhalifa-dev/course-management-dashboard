import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Course } from '../../../../core/models/course.model';
import { CanComponentDeactivate } from '../../../../core/guards/unsaved-changes.guard';
import { PageStateComponent } from '../../../../shared/components/page-state/page-state.component';
import { CourseFormComponent } from '../../components/course-form/course-form.component';
import { CourseFormValue } from '../../models/course-form.model';
import { CourseService } from '../../services/course.service';

/**
 * Host page for Add and Edit (smart component).
 *
 * Detects the mode from the route (`/courses/new` → Add, `/courses/edit/:id`
 * → Edit), loads the course in Edit mode, and persists changes through
 * CourseService only. Implements CanComponentDeactivate so the guard can warn
 * about unsaved changes.
 */
@Component({
  selector: 'app-course-form-page',
  templateUrl: './course-form-page.component.html',
  styleUrl: './course-form-page.component.scss',
  imports: [CardModule, ButtonModule, PageStateComponent, CourseFormComponent],
})
export class CourseFormPageComponent implements CanComponentDeactivate {
  private readonly courseService = inject(CourseService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  readonly id = input<string>();

  private readonly formRef = viewChild(CourseFormComponent);

  protected readonly isEditMode = computed(() => this.id() != null);
  protected readonly title = computed(() => (this.isEditMode() ? 'Edit Course' : 'Add Course'));
  protected readonly submitLabel = computed(() =>
    this.isEditMode() ? 'Update Course' : 'Create Course',
  );

  protected readonly course = signal<Course | null>(null);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);
  protected readonly notFound = signal<boolean>(false);
  protected readonly submitting = signal<boolean>(false);

  protected readonly emptyMessage = computed(() => `Course #${this.id()} was not found.`);

  constructor() {
    effect(() => {
      const id = this.id();
      if (id != null) {
        this.loadCourse(id);
      }
    });
  }

  loadCourse(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.notFound.set(false);

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

  retry(): void {
    const id = this.id();
    if (id != null) {
      this.loadCourse(id);
    }
  }

  onSave(value: CourseFormValue): void {
    this.submitting.set(true);
    const existing = this.course();

    if (this.isEditMode() && existing) {
      this.courseService
        .update(existing.id, { ...value, createdDate: existing.createdDate })
        .subscribe({
          next: () => this.onSaveSuccess('Course updated successfully.'),
          error: () => this.submitting.set(false),
        });
    } else {
      const createdDate = new Date().toISOString().slice(0, 10);
      this.courseService.create({ ...value, createdDate }).subscribe({
        next: () => this.onSaveSuccess('Course created successfully.'),
        error: () => this.submitting.set(false),
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/courses']);
  }

  canDeactivate(): boolean {
    return !this.formRef()?.isDirty();
  }

  private onSaveSuccess(detail: string): void {
    this.submitting.set(false);
    this.formRef()?.markSaved();
    this.messageService.add({ severity: 'success', summary: 'Success', detail });
    this.router.navigate(['/courses']);
  }
}
