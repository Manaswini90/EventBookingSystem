import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { CreateBookingComponent } from './features/booking/create-booking.component';
import { MyBookingsComponent } from './features/booking/my-bookings.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard]
    },
    {
        path: 'create-booking',
        component: CreateBookingComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['User'] }
    },
    {
        path: 'my-bookings',
        component: MyBookingsComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['User'] }
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];
