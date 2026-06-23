import { CanDeactivateFn } from '@angular/router';

/**
 * Implemented by any page (e.g. the course form) that wants to block
 * navigation while it holds unsaved changes.
 */
export interface CanComponentDeactivate {
  canDeactivate: () => boolean;
}

/**
 * Functional CanDeactivate guard. If the component reports unsaved changes,
 * the user is asked to confirm before leaving the route.
 */
export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  if (component?.canDeactivate && !component.canDeactivate()) {
    return confirm('You have unsaved changes. Leave this page and discard them?');
  }
  return true;
};
