import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginResponse {
  accessToken: string;
}

export const ACCESS_TOKEN_STORAGE_KEY = 'access_token';
export const API_URL = 'http://localhost:3001/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly http: HttpClient) {}

  private readonly accessToken = signal<string | null>(this.loadAccessToken());

  readonly isAuthenticated = computed(() => this.accessToken() !== null);

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, { email, password }).pipe(
      tap(({ accessToken }) => {
        localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
        this.accessToken.set(accessToken);
      }),
    );
  }

  register(name: string, email: string, password: string): Observable<unknown> {
    return this.http.post<unknown>(`${API_URL}/auth/register`, {
      name,
      email,
      password,
    });
  }

  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    this.accessToken.set(null);
  }

  private loadAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  }
}
