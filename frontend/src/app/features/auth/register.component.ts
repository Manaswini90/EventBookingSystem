import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <section class="mx-auto w-full max-w-md rounded-2xl border border-white/50 bg-white/90 p-6 shadow-xl shadow-slate-900/5 sm:p-8">
      <h1 class="text-3xl font-bold tracking-tight text-slate-900">Create account</h1>
      <p class="mt-2 text-sm text-slate-600">Join and start booking events in seconds.</p>

      @if (error()) {
        <p class="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{{ error() }}</p>
      }

      <form class="mt-6 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700" for="name">Full Name</label>
          <input
            id="name"
            type="text"
            formControlName="name"
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500"
            placeholder="Alex Johnson"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700" for="email">Email</label>
          <input
            id="email"
            type="email"
            formControlName="email"
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700" for="password">Password</label>
          <input
            id="password"
            type="password"
            formControlName="password"
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500"
            placeholder="At least 6 characters"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700" for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            formControlName="confirmPassword"
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500"
            placeholder="Repeat your password"
          />
        </div>

        @if (passwordMismatch()) {
          <p class="text-xs text-rose-600">Passwords must match.</p>
        }

        <button
          type="submit"
          [disabled]="submitting()"
          class="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ submitting() ? 'Creating account...' : 'Register' }}
        </button>
      </form>

      <p class="mt-6 text-sm text-slate-600">
        Already have an account?
        <a routerLink="/login" class="font-semibold text-emerald-700 hover:text-emerald-600">Login</a>
      </p>
    </section>
  `
})
export class RegisterComponent {
    private readonly fb = inject(FormBuilder);

    protected readonly submitting = signal(false);
    protected readonly error = signal<string | null>(null);

    protected readonly form = this.fb.nonNullable.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    });

    constructor(private readonly auth: AuthService) { }

    protected passwordMismatch(): boolean {
        const { password, confirmPassword } = this.form.getRawValue();
        return !!confirmPassword && password !== confirmPassword;
    }

    protected submit(): void {
        this.error.set(null);

        if (this.form.invalid || this.passwordMismatch()) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);
        const { confirmPassword: _unused, ...registerPayload } = this.form.getRawValue();

        this.auth.register(registerPayload).subscribe({
            next: () => this.submitting.set(false),
            error: (error) => {
                this.submitting.set(false);
                this.error.set(error?.error?.message ?? 'Unable to register right now.');
            }
        });
    }
}
