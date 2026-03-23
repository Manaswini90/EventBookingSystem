import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, AppRole } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const allowedRoles = (route.data?.['roles'] as AppRole[] | undefined) ?? [];

    if (!auth.isAuthenticated()) {
        return router.createUrlTree(['/login']);
    }

    if (!allowedRoles.length) {
        return true;
    }

    const role = auth.role();
    if (role && allowedRoles.includes(role)) {
        return true;
    }

    return router.createUrlTree(['/dashboard']);
};
