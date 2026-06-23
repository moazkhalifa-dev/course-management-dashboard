import { CourseCategory, CourseStatus } from '../../core/models/course.model';

export interface SelectOption<T = string> {
  label: string;
  value: T;
}

export type TagSeverity = 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast';

export const COURSE_CATEGORIES: readonly CourseCategory[] = ['Frontend', 'Backend', 'Design'];

export const COURSE_STATUSES: readonly CourseStatus[] = ['Active', 'Draft', 'Archived'];

export const CATEGORY_OPTIONS: SelectOption<CourseCategory>[] = COURSE_CATEGORIES.map((c) => ({
  label: c,
  value: c,
}));

export const STATUS_OPTIONS: SelectOption<CourseStatus>[] = COURSE_STATUSES.map((s) => ({
  label: s,
  value: s,
}));

export const STATUS_FILTER_OPTIONS: SelectOption<CourseStatus | null>[] = [
  { label: 'All Statuses', value: null },
  ...STATUS_OPTIONS,
];

export const STATUS_SEVERITY: Record<CourseStatus, TagSeverity> = {
  Active: 'success',
  Draft: 'warn',
  Archived: 'danger',
};

export const COURSE_NAME_MIN_LENGTH = 3;
export const DESCRIPTION_MAX_LENGTH = 500;
