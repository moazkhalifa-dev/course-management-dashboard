import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

/**
 * Wraps a view in the three cross-cutting UI states:
 * loading (skeleton), error (message + retry) and empty ("No Courses Found").
 * When none apply, the projected content is shown.
 */
@Component({
  selector: 'app-page-state',
  imports: [SkeletonModule, ButtonModule],
  template: `
    @if (loading()) {
      <div class="page-state__skeleton" role="status" aria-label="Loading">
        <p-skeleton height="3rem" styleClass="mb-3" />
        @for (row of skeletonRows; track row) {
          <p-skeleton height="2.25rem" styleClass="mb-2" />
        }
      </div>
    } @else if (error()) {
      <div class="page-state__message" role="alert">
        <i class="pi pi-exclamation-triangle page-state__icon page-state__icon--error"></i>
        <p class="page-state__text">{{ error() }}</p>
        <p-button label="Retry" icon="pi pi-refresh" (onClick)="retry.emit()" />
      </div>
    } @else if (empty()) {
      <div class="page-state__message">
        <i class="pi pi-inbox page-state__icon"></i>
        <p class="page-state__text">{{ emptyMessage() }}</p>
      </div>
    } @else {
      <ng-content />
    }
  `,
  styles: `
    .page-state__skeleton {
      padding: 1rem;
    }
    .page-state__message {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 3rem 1rem;
      text-align: center;
    }
    .page-state__icon {
      font-size: 2.75rem;
      color: var(--p-text-muted-color);
    }
    .page-state__icon--error {
      color: var(--p-red-500);
    }
    .page-state__text {
      margin: 0;
      font-size: 1.1rem;
      color: var(--p-text-muted-color);
    }
  `,
})
export class PageStateComponent {
  readonly loading = input<boolean>(false);
  readonly error = input<string | null>(null);
  readonly empty = input<boolean>(false);
  readonly emptyMessage = input<string>('No Courses Found');

  /** Emitted when the user clicks "Retry" in the error state. */
  readonly retry = output<void>();

  /** Placeholder rows rendered while loading. */
  protected readonly skeletonRows = Array.from({ length: 6 }, (_, i) => i);
}
