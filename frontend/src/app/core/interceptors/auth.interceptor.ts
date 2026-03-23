import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UiService } from '../services/ui.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
    const auth = inject(AuthService);
    const ui = inject(UiService);
    const router = inject(Router);

    const token = auth.token();
    const clonedRequest = token
        ? request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        })
        : request;

    ui.showLoader();

    return next(clonedRequest).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                auth.logout(false);
                ui.toast('Session expired. Please sign in again.', 'error');
                router.navigateByUrl('/login');
            }

            if (error.status === 403) {
                ui.toast('You do not have permission for this action.', 'error');
            }

            return throwError(() => error);
        }),
        finalize(() => ui.hideLoader())
    );
};
