import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Booking, BookingService } from '../../core/services/booking.service';

@Component({
    selector: 'app-my-bookings',
    standalone: true,
    imports: [CommonModule],
    template: `
    <section class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">My Bookings</h1>
        <button
          type="button"
          class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
          (click)="loadBookings()"
          [disabled]="loading()"
        >
          {{ loading() ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>

      @if (error()) {
        <p class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{{ error() }}</p>
      }

      <div class="grid gap-4 sm:grid-cols-2">
        @for (booking of bookings(); track booking.id ?? booking.eventName) {
          <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 class="text-lg font-semibold text-slate-900">{{ booking.eventName }}</h2>
            <p class="mt-2 text-sm text-slate-600">Booked by: {{ booking.userEmail }}</p>
            @if (booking.createdAt) {
              <p class="mt-1 text-xs text-slate-500">Created: {{ booking.createdAt | date: 'medium' }}</p>
            }
          </article>
        } @empty {
          @if (!loading()) {
            <article class="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 sm:col-span-2">
              No bookings found yet.
            </article>
          }
        }
      </div>
    </section>
  `
})
export class MyBookingsComponent implements OnInit {
    protected readonly bookings = signal<Booking[]>([]);
    protected readonly loading = signal(false);
    protected readonly error = signal<string | null>(null);

    constructor(private readonly bookingService: BookingService) { }

    ngOnInit(): void {
        this.loadBookings();
    }

    protected loadBookings(): void {
        this.loading.set(true);
        this.error.set(null);

        this.bookingService.getMyBookings().subscribe({
            next: (bookings) => {
                this.bookings.set(bookings);
                this.loading.set(false);
            },
            error: (error) => {
                this.loading.set(false);
                this.error.set(error?.error?.message ?? 'Unable to load your bookings.');
            }
        });
    }
}
