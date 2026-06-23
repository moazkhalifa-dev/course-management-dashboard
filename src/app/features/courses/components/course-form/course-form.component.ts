import { NgClass } from '@angular/common';
import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { Course } from '../../../../core/models/course.model';
import {
  CATEGORY_OPTIONS,
  COURSE_NAME_MIN_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  STATUS_OPTIONS,
} from '../../../../shared/constants/course.constants';
import { CourseFormModel, CourseFormValue } from '../../models/course-form.model';

/**
 * Reusable reactive form for course data (presentational component).
 *
 * Owns the typed FormGroup and renders the PrimeNG inputs with inline
 * validation. It performs no data access: the parent page receives the
 * validated value via `save` and persists it through CourseService.
 */
@Component({
  selector: 'app-course-form',
  imports: [
    ReactiveFormsModule,
    NgClass,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
    MessageModule,
    ButtonModule,
  ],
  templateUrl: './course-form.component.html',
  styleUrl: './course-form.component.scss',
})
export class CourseFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly course = input<Course | null>(null);
  readonly submitting = input<boolean>(false);
  readonly submitLabel = input<string>('Save');

  readonly save = output<CourseFormValue>();
  readonly formCancel = output<void>();

  protected readonly categoryOptions = CATEGORY_OPTIONS;
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly nameMinLength = COURSE_NAME_MIN_LENGTH;
  protected readonly descriptionMaxLength = DESCRIPTION_MAX_LENGTH;

  readonly form: FormGroup<CourseFormModel> = this.fb.group<CourseFormModel>({
    courseName: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(COURSE_NAME_MIN_LENGTH),
    ]),
    instructorName: this.fb.nonNullable.control('', [Validators.required]),
    category: this.fb.control(null, [Validators.required]),
    duration: this.fb.control(null, [Validators.required, Validators.min(1)]),
    price: this.fb.control(null, [Validators.required, Validators.min(0)]),
    status: this.fb.control(null, [Validators.required]),
    description: this.fb.nonNullable.control('', [Validators.maxLength(DESCRIPTION_MAX_LENGTH)]),
  });

  constructor() {
    // Patch the form whenever an existing course is provided (Edit mode).
    effect(() => {
      const course = this.course();
      if (course) {
        this.form.patchValue({
          courseName: course.courseName,
          instructorName: course.instructorName,
          category: course.category,
          duration: course.duration,
          price: course.price,
          status: course.status,
          description: course.description ?? '',
        });
        this.form.markAsPristine();
      }
    });
  }

  isDirty(): boolean {
    return this.form.dirty;
  }

  markSaved(): void {
    this.form.markAsPristine();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.save.emit({
      courseName: raw.courseName.trim(),
      instructorName: raw.instructorName.trim(),
      category: raw.category!,
      duration: raw.duration!,
      price: raw.price!,
      status: raw.status!,
      description: raw.description.trim(),
    });
  }

  protected showError(controlName: keyof CourseFormModel): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }
}
