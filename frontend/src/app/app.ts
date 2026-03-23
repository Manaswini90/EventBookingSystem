import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar.component';
import { UiService } from './core/services/ui.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <div class="min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(15,118,110,0.2),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(14,116,144,0.22),transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]">
      <app-navbar />

      <main class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <router-outlet />
      </main>

      @if (ui.isLoading()) {
        <div class="pointer-events-none fixed inset-0 z-[60] grid place-items-center bg-slate-900/10 backdrop-blur-[1px]">
          <div class="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700"></div>
        </div>
      }

      <div class="fixed bottom-4 right-4 z-[70] flex w-[min(92vw,24rem)] flex-col gap-2">
        @for (toast of ui.toasts(); track toast.id) {
          <article
            class="rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur"
            [class]="
              toast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50/95 text-emerald-800'
                : toast.type === 'error'
                  ? 'border-rose-200 bg-rose-50/95 text-rose-800'
                  : 'border-sky-200 bg-sky-50/95 text-sky-800'
            "
          >
            <div class="flex items-center justify-between gap-3">
              <p class="font-medium">{{ toast.text }}</p>
              <button
                type="button"
                class="text-xs font-semibold uppercase tracking-wider opacity-70 transition hover:opacity-100"
                (click)="ui.dismiss(toast.id)"
              >
                close
              </button>
            </div>
          </article>
        }
      </div>
    </div>
  `
})
export class App {
  constructor(protected readonly ui: UiService) { }
}
