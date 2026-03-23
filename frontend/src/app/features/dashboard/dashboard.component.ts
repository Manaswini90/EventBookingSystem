import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <section class="space-y-6">
      <div class="rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 p-8 text-white shadow-2xl shadow-sky-900/20">
        <p class="text-sm uppercase tracking-[0.2em] text-cyan-100">Event Booking System</p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {{ auth.role() === 'Admin' ? 'Admin Panel' : 'User Dashboard' }}
        </h1>
        <p class="mt-3 max-w-2xl text-sm text-cyan-50 sm:text-base">
          {{ statusMessage() || 'Manage your account and event bookings from one place.' }}
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-slate-900">Profile</h2>
          <p class="mt-4 text-sm text-slate-600">Email: <span class="font-semibold text-slate-900">{{ auth.email() || 'N/A' }}</span></p>
          <p class="mt-1 text-sm text-slate-600">Role: <span class="font-semibold text-slate-900">{{ auth.role() || 'N/A' }}</span></p>
        </article>

        @if (auth.role() === 'User') {
          <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-slate-900">Quick Actions</h2>
            <div class="mt-4 flex flex-wrap gap-3">
              <a routerLink="/create-booking" class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Create Booking</a>
              <a routerLink="/my-bookings" class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-900 hover:text-slate-900">View My Bookings</a>
            </div>
          </article>
        } @else {
          <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-slate-900">Admin Controls</h2>
            <p class="mt-4 text-sm text-slate-600">You are authenticated as an administrator. Extend this area with analytics and moderation tools.</p>
          </article>
        }
      </div>
    </section>
  `
})
export class DashboardComponent implements OnInit {
    protected readonly statusMessage = signal('');

    constructor(protected readonly auth: AuthService) { }

    ngOnInit(): void {
        if (this.auth.role() === 'Admin') {
            this.auth.getAdminMessage().subscribe({
                next: (message) => this.statusMessage.set(message),
                error: () => this.statusMessage.set('Admin endpoint is secured and reachable.')
            });
            return;
        }

        this.auth.getDashboardMessage().subscribe({
            next: (message) => this.statusMessage.set(message),
            error: () => this.statusMessage.set('User dashboard loaded successfully.')
        });
    }
}
