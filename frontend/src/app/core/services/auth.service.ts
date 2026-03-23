import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { UiService } from './ui.service';

const API_BASE_URL = 'http://localhost:5291/api';
const TOKEN_KEY = 'event_booking_token';

export type AppRole = 'Admin' | 'User';

interface JwtPayload {
    exp?: number;
    email?: string;
    unique_name?: string;
    role?: string;
    [key: string]: unknown;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    token?: string;
    jwt?: string;
}

export interface UserProfile {
    id?: number;
    name?: string;
    email?: string;
    role?: string;
    [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly apiUrl = `${API_BASE_URL}/Auth`;

    private readonly tokenState = signal<string | null>(localStorage.getItem(TOKEN_KEY));
    private readonly payloadState = signal<JwtPayload | null>(null);
    private readonly profileState = signal<UserProfile | null>(null);

    readonly token = computed(() => this.tokenState());
    readonly profile = computed(() => this.profileState());

    readonly role = computed<AppRole | null>(() => {
        const payload = this.payloadState();
        if (!payload) {
            return null;
        }

        const role =
            this.readString(payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) ??
            this.readString(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role']) ??
            this.readString(payload.role);

        return role === 'Admin' || role === 'User' ? role : null;
    });

    readonly email = computed(() => {
        const payload = this.payloadState();
        if (!payload) {
            return null;
        }

        return (
            this.readString(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']) ??
            this.readString(payload.email) ??
            this.readString(payload.unique_name)
        );
    });

    readonly isAuthenticated = computed(() => {
        const token = this.tokenState();
        const payload = this.payloadState();

        return !!token && !!payload && !this.isExpired(payload);
    });

    constructor(
        private readonly http: HttpClient,
        private readonly router: Router,
        private readonly ui: UiService
    ) {
        this.restoreSession();
    }

    restoreSession(): void {
        const token = this.tokenState();

        if (!token) {
            this.clearSession();
            return;
        }

        const payload = this.decodeToken(token);
        if (!payload || this.isExpired(payload)) {
            this.clearSession();
            return;
        }

        this.payloadState.set(payload);
        this.loadProfile().subscribe();
    }

    register(payload: RegisterRequest): Observable<unknown> {
        return this.http.post<AuthResponse | unknown>(`${this.apiUrl}/register`, payload).pipe(
            tap((response) => {
                const token = this.extractToken(response);
                if (token) {
                    this.setSession(token);
                    this.ui.toast('Registration successful.', 'success');
                    this.router.navigateByUrl('/dashboard');
                    return;
                }

                this.ui.toast('Registration successful. Please login.', 'success');
                this.router.navigateByUrl('/login');
            })
        );
    }

    login(payload: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
            tap((response) => {
                const token = this.extractToken(response);
                if (!token) {
                    throw new Error('Authentication token was not returned by the API.');
                }

                this.setSession(token);
                this.ui.toast('Welcome back!', 'success');
                this.router.navigateByUrl('/dashboard');
            })
        );
    }

    logout(redirect = true): void {
        this.clearSession();
        if (redirect) {
            this.router.navigateByUrl('/login');
        }
        this.ui.toast('You have been logged out.', 'info');
    }

    hasRole(role: AppRole): boolean {
        return this.role() === role;
    }

    loadProfile(): Observable<UserProfile | null> {
        if (!this.isAuthenticated()) {
            return of(null);
        }

        return this.http.get<UserProfile>(`${this.apiUrl}/profile`).pipe(
            tap((profile) => this.profileState.set(profile)),
            catchError(() => {
                this.profileState.set(null);
                return of(null);
            })
        );
    }

    getAdminMessage(): Observable<string> {
        return this.http
            .get(`${this.apiUrl}/admin`, { responseType: 'text' })
            .pipe(map((value) => value || 'Admin endpoint reachable.'));
    }

    getUserMessage(): Observable<string> {
        return this.http
            .get(`${this.apiUrl}/user`, { responseType: 'text' })
            .pipe(map((value) => value || 'User endpoint reachable.'));
    }

    getDashboardMessage(): Observable<string> {
        return this.http
            .get(`${this.apiUrl}/dashboard`, { responseType: 'text' })
            .pipe(map((value) => value || 'User dashboard data loaded.'));
    }

    private setSession(token: string): void {
        const payload = this.decodeToken(token);

        if (!payload || this.isExpired(payload)) {
            this.clearSession();
            throw new Error('The provided token is invalid or expired.');
        }

        localStorage.setItem(TOKEN_KEY, token);
        this.tokenState.set(token);
        this.payloadState.set(payload);
        this.loadProfile().subscribe();
    }

    private clearSession(): void {
        localStorage.removeItem(TOKEN_KEY);
        this.tokenState.set(null);
        this.payloadState.set(null);
        this.profileState.set(null);
    }

    private extractToken(response: unknown): string | null {
        if (!response || typeof response !== 'object') {
            return null;
        }

        const candidate = response as AuthResponse;
        return candidate.token ?? candidate.jwt ?? null;
    }

    private decodeToken(token: string): JwtPayload | null {
        try {
            const parts = token.split('.');
            if (parts.length < 2) {
                return null;
            }

            const normalizedPayload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const paddedPayload = normalizedPayload.padEnd(
                normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
                '='
            );

            const payloadJson = atob(paddedPayload);
            return JSON.parse(payloadJson) as JwtPayload;
        } catch {
            return null;
        }
    }

    private isExpired(payload: JwtPayload): boolean {
        if (!payload.exp) {
            return false;
        }

        const nowInSeconds = Math.floor(Date.now() / 1000);
        return payload.exp < nowInSeconds;
    }

    private readString(value: unknown): string | null {
        return typeof value === 'string' ? value : null;
    }
}
