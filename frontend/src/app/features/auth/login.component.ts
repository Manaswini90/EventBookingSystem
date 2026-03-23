import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <section class="mx-auto w-full max-w-md rounded-2xl border border-white/50 bg-white/90 p-6 shadow-xl shadow-slate-900/5 sm:p-8">
      <h1 class="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>
      <p class="mt-2 text-sm text-slate-600">Sign in to manage your bookings.</p>

      @if (error()) {
        <p class="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{{ error() }}</p>
      }

      <form class="mt-6 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700" for="email">Email</label>
          <input
            id="email"
            type="email"
            formControlName="email"
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-cyan-500"
            placeholder="you@example.com"
          />
          @if (form.controls.email.touched && form.controls.email.invalid) {
            <p class="mt-1 text-xs text-rose-600">Enter a valid email address.</p>
          }
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700" for="password">Password</label>
          <input
            id="password"
            type="password"
            formControlName="password"
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500"
            placeholder="Enter your password"
          />
          @if (form.controls.password.touched && form.controls.password.invalid) {
            <p class="mt-1 text-xs text-rose-600">Password must be at least 6 characters.</p>
          }
        </div>

        <button
          type="submit"
          [disabled]="submitting()"
          class="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ submitting() ? 'Signing in...' : 'Login' }}
        </button>
      </form>

      <p class="mt-6 text-sm text-slate-600">
        No account?
        <a routerLink="/register" class="font-semibold text-cyan-700 hover:text-cyan-600">Create one</a>
      </p>
    </section>
  `
})
export class LoginComponent {
    private readonly fb = inject(FormBuilder);

    protected readonly submitting = signal(false);
    protected readonly error = signal<string | null>(null);

    protected readonly form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
    });

    constructor(private readonly auth: AuthService) { }

    protected submit(): void {
        this.error.set(null);

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        this.auth.login(this.form.getRawValue()).subscribe({
            next: () => this.submitting.set(false),
            error: (error) => {
                this.submitting.set(false);
                this.error.set(error?.error?.message ?? 'Unable to login. Please check your credentials.');
            }
        });
    }
}
