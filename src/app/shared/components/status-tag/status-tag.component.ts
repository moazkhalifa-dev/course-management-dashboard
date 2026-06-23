import { Component, computed, input } from '@angular/core';
import { Tag } from 'primeng/tag';
import { CourseStatus } from '../../../core/models/course.model';
import { STATUS_SEVERITY } from '../../constants/course.constants';

/**
 * Renders a course status as a colored PrimeNG tag
 * (Active → success, Draft → warn, Archived → danger).
 */
@Component({
  selector: 'app-status-tag',
  imports: [Tag],
  template: `<p-tag [value]="status()" [severity]="severity()" />`,
})
export class StatusTagComponent {
  readonly status = input.required<CourseStatus>();
  readonly severity = computed(() => STATUS_SEVERITY[this.status()]);
}
