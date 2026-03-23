import { computed, Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: number;
    text: string;
    type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class UiService {
    private readonly loadingCounter = signal(0);
    private readonly toastStore = signal<ToastMessage[]>([]);

    readonly isLoading = computed(() => this.loadingCounter() > 0);
    readonly toasts = computed(() => this.toastStore());

    showLoader(): void {
        this.loadingCounter.update((value) => value + 1);
    }

    hideLoader(): void {
        this.loadingCounter.update((value) => (value > 0 ? value - 1 : 0));
    }

    toast(text: string, type: ToastType = 'info', durationMs = 3000): void {
        const message: ToastMessage = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            text,
            type
        };

        this.toastStore.update((messages) => [...messages, message]);
        setTimeout(() => this.dismiss(message.id), durationMs);
    }

    dismiss(id: number): void {
        this.toastStore.update((messages) => messages.filter((message) => message.id !== id));
    }
}
