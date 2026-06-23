import { FormControl } from '@angular/forms';
import { Course, CourseCategory, CourseStatus } from '../../../core/models/course.model';

/**
 * Strongly-typed reactive form shape shared by the Add and Edit pages.
 * Numeric controls allow `null` so the form is valid-by-type before the
 * user types a value (validation enforces required/min rules at runtime).
 */
export interface CourseFormModel {
  courseName: FormControl<string>;
  instructorName: FormControl<string>;
  category: FormControl<CourseCategory | null>;
  duration: FormControl<number | null>;
  price: FormControl<number | null>;
  status: FormControl<CourseStatus | null>;
  description: FormControl<string>;
}

/**
 * Validated payload emitted by the form on submit. The `id` and
 * `createdDate` fields are owned by the page (server id / auto-generated
 * creation date), not the form.
 */
export type CourseFormValue = Omit<Course, 'id' | 'createdDate'>;
