import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { UiService } from '../../core/services/ui.service';

@Component({
    selector: 'app-create-booking',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <section class="mx-auto w-full max-w-2xl rounded-2xl border border-white/50 bg-white/90 p-6 shadow-xl shadow-slate-900/5 sm:p-8">
      <h1 class="text-3xl font-bold tracking-tight text-slate-900">Create Booking</h1>
      <p class="mt-2 text-sm text-slate-600">Reserve your seat for the next event.</p>

      @if (error()) {
        <p class="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{{ error() }}</p>
      }

      <form class="mt-6 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700" for="eventName">Event Name</label>
          <input
            id="eventName"
            type="text"
            formControlName="eventName"
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500"
            placeholder="Annual Tech Meetup"
          />
          @if (form.controls.eventName.touched && form.controls.eventName.invalid) {
            <p class="mt-1 text-xs text-rose-600">Event name must be at least 3 characters.</p>
          }
        </div>

        <button
          type="submit"
          [disabled]="submitting()"
          class="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ submitting() ? 'Creating booking...' : 'Create Booking' }}
        </button>
      </form>
    </section>
  `
})
export class CreateBookingComponent {
    private readonly fb = inject(FormBuilder);

    protected readonly submitting = signal(false);
    protected readonly error = signal<string | null>(null);

    protected readonly form = this.fb.nonNullable.group({
        eventName: ['', [Validators.required, Validators.minLength(3)]]
    });

    constructor(
        private readonly bookingService: BookingService,
        private readonly ui: UiService,
        private readonly router: Router
    ) { }

    protected submit(): void {
        this.error.set(null);

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting.set(true);

        this.bookingService.createBooking(this.form.controls.eventName.value).subscribe({
            next: () => {
                this.submitting.set(false);
                this.ui.toast('Booking created successfully.', 'success');
                this.router.navigateByUrl('/my-bookings');
            },
            error: (error) => {
                this.submitting.set(false);
                this.error.set(error?.error?.message ?? error?.message ?? 'Could not create booking.');
            }
        });
    }
}
