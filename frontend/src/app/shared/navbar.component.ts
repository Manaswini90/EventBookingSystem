import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    template: `
    <header class="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a routerLink="/dashboard" class="text-xl font-bold tracking-tight text-slate-900">
          EventSphere
        </a>

        <button
          type="button"
          class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 md:hidden"
          (click)="menuOpen.update((value) => !value)"
          aria-label="Toggle menu"
        >
          Menu
        </button>

        <div class="hidden items-center gap-3 md:flex">
          @if (!auth.isAuthenticated()) {
            <a
              routerLink="/login"
              routerLinkActive="bg-slate-900 text-white"
              class="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Login
            </a>
            <a
              routerLink="/register"
              routerLinkActive="bg-slate-900 text-white"
              class="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              Register
            </a>
          } @else {
            <a
              routerLink="/dashboard"
              routerLinkActive="bg-slate-900 text-white"
              class="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Dashboard
            </a>
            <a
              routerLink="/create-booking"
              routerLinkActive="bg-slate-900 text-white"
              class="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Create Booking
            </a>
            <a
              routerLink="/my-bookings"
              routerLinkActive="bg-slate-900 text-white"
              class="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              My Bookings
            </a>
            <button
              type="button"
              class="rounded-full border border-rose-300 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
              (click)="logout()"
            >
              Logout
            </button>
          }
        </div>
      </nav>

      @if (menuOpen()) {
        <div class="space-y-2 border-t border-slate-200 px-4 py-4 md:hidden">
          @if (!auth.isAuthenticated()) {
            <a routerLink="/login" class="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700" (click)="closeMenu()">Login</a>
            <a routerLink="/register" class="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700" (click)="closeMenu()">Register</a>
          } @else {
            <a routerLink="/dashboard" class="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700" (click)="closeMenu()">Dashboard</a>
            <a routerLink="/create-booking" class="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700" (click)="closeMenu()">Create Booking</a>
            <a routerLink="/my-bookings" class="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700" (click)="closeMenu()">My Bookings</a>
            <button type="button" class="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600" (click)="logout()">
              Logout
            </button>
          }
        </div>
      }
    </header>
  `
})
export class NavbarComponent {
    protected readonly menuOpen = signal(false);

    constructor(protected readonly auth: AuthService) { }

    protected closeMenu(): void {
        this.menuOpen.set(false);
    }

    protected logout(): void {
        this.closeMenu();
        this.auth.logout();
    }
}
