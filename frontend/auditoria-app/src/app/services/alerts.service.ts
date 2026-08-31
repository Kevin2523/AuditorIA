import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of, shareReplay, switchMap, tap, timer } from 'rxjs';

export type AlertSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved' | 'dismissed';

export interface AuditorIAAlert {
  id: string;
  tenantId?: string;
  dispositivo?: string;
  mensaje?: string;
  severidad?: AlertSeverity;
  status?: AlertStatus;
  timestamp?: string;
  createdAt?: string;
  raw?: unknown;

  // Fallback compatibility fields
  deviceId?: string | null;
  hostname?: string | null;
  message?: string;
  severity?: AlertSeverity;
  occurredAt?: string;
  receivedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AlertsService {
  private readonly endpoint = '/api/v1/alerts';
  private readonly pollMs = 30_000; // 30 segundos polling

  readonly alerts = signal<AuditorIAAlert[]>([]);
  readonly loading = signal(true);
  readonly isOffline = signal(false);

  readonly alerts$ = timer(0, this.pollMs).pipe(
    switchMap(() =>
      this.http.get<any>(this.endpoint).pipe(
        map((response) => {
          let list: AuditorIAAlert[] = [];
          if (Array.isArray(response)) {
            list = response;
          } else if (response && Array.isArray(response.data)) {
            list = response.data;
          } else if (response && Array.isArray(response.alerts)) {
            list = response.alerts;
          }
          return { alerts: list.slice(0, 20), offline: false };
        }),
        catchError(() => of({ alerts: this.alerts(), offline: true })),
      ),
    ),
    tap(({ alerts, offline }) => {
      this.alerts.set(alerts);
      this.isOffline.set(offline);
      this.loading.set(false);
    }),
    map(({ alerts }) => alerts),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  constructor(private readonly http: HttpClient) {
    this.alerts$.subscribe();
  }
}
