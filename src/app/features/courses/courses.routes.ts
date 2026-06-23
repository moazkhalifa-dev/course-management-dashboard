import { Routes } from '@angular/router';
import { unsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';

/**
 * Lazy-loaded routes for the Courses feature.
 *
 * Order matters: the static `new` and `edit/:id` paths are declared before
 * the dynamic `:id` path so they are not captured as an id.
 */
export const COURSES_ROUTES: Routes = [
  {
    path: '',
    title: 'Courses',
    loadComponent: () =>
      import('./pages/list/course-list.component').then((m) => m.CourseListComponent),
  },
  {
    path: 'new',
    title: 'Add Course',
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () =>
      import('./pages/form/course-form-page.component').then((m) => m.CourseFormPageComponent),
  },
  {
    path: 'edit/:id',
    title: 'Edit Course',
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () =>
      import('./pages/form/course-form-page.component').then((m) => m.CourseFormPageComponent),
  },
  {
    path: ':id',
    title: 'Course Details',
    loadComponent: () =>
      import('./pages/details/course-details.component').then((m) => m.CourseDetailsComponent),
  },
];
