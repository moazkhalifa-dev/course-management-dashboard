/**
 * Domain model for a Course entity.
 * This is the single source of truth for the Course shape across the app.
 */

export type CourseStatus = 'Active' | 'Draft' | 'Archived';

export type CourseCategory = 'Frontend' | 'Backend' | 'Design';

export interface Course {
  /**
   * Course identifier. Stored as a string so it works with json-server v1
   * (which may emit string ids). New courses get a sequential numeric value
   * generated on the frontend (e.g. "6"), matching the assignment sample.
   */
  id: string;
  courseName: string;
  instructorName: string;
  category: CourseCategory;
  duration: number;
  price: number;
  status: CourseStatus;
  description?: string;
  createdDate: string;
}

export type CreateCoursePayload = Omit<Course, 'id'>;

export type UpdateCoursePayload = Omit<Course, 'id'>;
