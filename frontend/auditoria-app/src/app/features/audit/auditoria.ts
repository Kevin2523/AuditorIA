import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertsService, AuditorIAAlert, AlertSeverity } from '../../services/alerts.service';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.css',
})
export class AuditoriaComponent {
  protected readonly alerts = inject(AlertsService);

  formatTime(alert: AuditorIAAlert): string {
    const isoString = alert.timestamp || alert.createdAt || alert.receivedAt || alert.occurredAt;
    if (!isoString) return '--:--';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '--:--';
      return new Intl.DateTimeFormat('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date);
    } catch {
      return '--:--';
    }
  }

  getHost(alert: AuditorIAAlert): string {
    return alert.dispositivo || alert.hostname || alert.deviceId || 'Dispositivo no identificado';
  }

  getMessage(alert: AuditorIAAlert): string {
    return alert.mensaje || alert.message || 'Sin datos de análisis de IA.';
  }

  getSeverity(alert: AuditorIAAlert): AlertSeverity {
    const sev = (alert.severidad || alert.severity || 'info').toLowerCase();
    if (['critical', 'high', 'medium', 'low', 'info'].includes(sev)) {
      return sev as AlertSeverity;
    }
    return 'info';
  }

  getSeverityBorderClass(alert: AuditorIAAlert): string {
    const sev = this.getSeverity(alert);
    switch (sev) {
      case 'critical':
        return 'border-l-4 border-l-[#ef4444]';
      case 'high':
        return 'border-l-4 border-l-[#f97316]';
      case 'medium':
        return 'border-l-4 border-l-[#eab308]';
      case 'low':
        return 'border-l-4 border-l-[#3b82f6]';
      case 'info':
      default:
        return 'border-l-4 border-l-[#6b7280]';
    }
  }

  getSeverityBadgeClass(alert: AuditorIAAlert): string {
    const sev = this.getSeverity(alert);
    switch (sev) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'info':
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/40';
    }
  }

  getSeverityDotClass(alert: AuditorIAAlert): string {
    const sev = this.getSeverity(alert);
    switch (sev) {
      case 'critical':
        return 'bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.8)]';
      case 'high':
        return 'bg-[#f97316] shadow-[0_0_8px_rgba(249,115,22,0.8)]';
      case 'medium':
        return 'bg-[#eab308] shadow-[0_0_8px_rgba(234,179,8,0.8)]';
      case 'low':
        return 'bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.8)]';
      case 'info':
      default:
        return 'bg-[#6b7280]';
    }
  }
}
