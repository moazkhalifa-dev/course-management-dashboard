import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

/**
 * Centralizes HTTP error handling: surfaces a toast for any failed request
 * and re-throws so components/services can still react if they need to.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const detail =
        error.status === 0
          ? 'Cannot reach the server. Is the mock API running?'
          : (error.error?.message ?? error.message ?? 'Something went wrong');

      messageService.add({ severity: 'error', summary: 'Error', detail });
      return throwError(() => error);
    }),
  );
};
