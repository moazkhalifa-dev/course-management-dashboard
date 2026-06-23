import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { Course, CourseStatus } from '../../../../core/models/course.model';
import { PageStateComponent } from '../../../../shared/components/page-state/page-state.component';
import { StatusTagComponent } from '../../../../shared/components/status-tag/status-tag.component';
import { STATUS_FILTER_OPTIONS } from '../../../../shared/constants/course.constants';
import { CourseService } from '../../services/course.service';

/**
 * Courses list page (smart component).
 *
 * Orchestrates the UI: search, status filter, sorting and pagination are
 * handled by p-table, while all data/CRUD work is delegated to CourseService.
 * Delete is confirmed via ConfirmationService and reported via MessageService.
 */
@Component({
  selector: 'app-course-list',
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss',
  imports: [
    RouterLink,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    TableModule,
    ButtonModule,
    CardModule,
    SelectModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    PageStateComponent,
    StatusTagComponent,
  ],
})
export class CourseListComponent implements OnInit {
  private readonly courseService = inject(CourseService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  // Expose service state to the template.
  protected readonly courses = this.courseService.courses;
  protected readonly loading = this.courseService.loading;
  protected readonly error = this.courseService.error;
  protected readonly isEmpty = this.courseService.isEmpty;

  protected readonly statusFilterOptions = STATUS_FILTER_OPTIONS;
  protected readonly selectedStatus = signal<CourseStatus | null>(null);
  protected readonly searchTerm = signal<string>('');

  ngOnInit(): void {
    this.loadCourses();
  }

  /** (Re)loads the course list; also used by the error-state retry button. */
  loadCourses(): void {
    this.courseService.loadCourses();
  }

  /** Filters the table by course name as the user types. */
  onSearch(value: string, table: Table): void {
    this.searchTerm.set(value);
    table.filter(value, 'courseName', 'contains');
  }

  /** Filters the table by the selected status (null = all statuses). */
  onStatusChange(status: CourseStatus | null, table: Table): void {
    this.selectedStatus.set(status);
    table.filter(status, 'status', 'equals');
  }

  /** Clears both the search box and the status filter. */
  clearFilters(table: Table): void {
    this.searchTerm.set('');
    this.selectedStatus.set(null);
    table.clear();
  }

  /** Asks for confirmation before deleting a course. */
  confirmDelete(course: Course): void {
    this.confirmationService.confirm({
      header: 'Delete Course',
      message: `Are you sure you want to delete "${course.courseName}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteCourse(course),
    });
  }

  /** Delegates deletion to the service and reports the result via toast. */
  private deleteCourse(course: Course): void {
    this.courseService.delete(course.id).subscribe({
      next: () =>
        this.messageService.add({
          severity: 'success',
          summary: 'Course Deleted',
          detail: `"${course.courseName}" was removed successfully.`,
        }),
      // Errors are surfaced by the global error interceptor toast.
    });
  }
}
