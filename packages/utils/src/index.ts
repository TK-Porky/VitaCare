import type { AppointmentStatus } from '@vitacare/shared-types';

// Formatage date en français (Cameroun)
export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('fr-CM', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate));
}

// Badge couleur selon statut RDV
export function getStatusColor(status: AppointmentStatus): string {
  const map: Record<AppointmentStatus, string> = {
    pending:   '#F59E0B',
    confirmed: '#10B981',
    cancelled: '#EF4444',
    completed: '#6B7280',
    no_show:   '#DC2626',
  };
  return map[status];
}

// Formatage numéro de téléphone camerounais
export function formatCMPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length <= 1) return cleaned;
  const firstDigit = cleaned.substring(0, 1);
  const remainingDigits = cleaned.substring(1);
  const match = remainingDigits.match(/.{1,2}/g);
  return match ? `${firstDigit} ${match.join(' ')}` : firstDigit;
}

// Validation numéro de téléphone camerounais
export function isValidCMPhone(phone: string): boolean {
  return /^(\+237|237)?[62][0-9]{8}$/.test(phone.replace(/\s/g, ''));
}
