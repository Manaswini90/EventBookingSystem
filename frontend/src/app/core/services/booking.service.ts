import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';

const API_BASE_URL = 'http://localhost:5291/api';

export interface Booking {
    id?: number;
    eventName: string;
    userEmail: string;
    createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
    private readonly apiUrl = `${API_BASE_URL}/Booking`;

    constructor(
        private readonly http: HttpClient,
        private readonly auth: AuthService
    ) { }

    createBooking(eventName: string): Observable<Booking> {
        const userEmail = this.auth.email();

        if (!userEmail) {
            return throwError(() => new Error('Unable to determine user email from token.'));
        }

        return this.http.post<Booking>(`${this.apiUrl}/create`, {
            eventName,
            userEmail
        });
    }

    getMyBookings(): Observable<Booking[]> {
        return this.http.get<Booking[] | { bookings: Booking[] }>(`${this.apiUrl}/my`).pipe(
            map((response) => {
                if (Array.isArray(response)) {
                    return response;
                }

                return response?.bookings ?? [];
            })
        );
    }
}
