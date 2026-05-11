export interface Appointment {
  id: string;
  doctorName: string;
  doctorAvatarUri: string;
  avatarUri?: string; // Legacy field for compatibility
  specialty: string;
  motif: string;
  clinic: string;
  address: string;
  date: string;
  time: string;
  dateTime?: string; // Legacy field for compatibility
  status: 'confirmed' | 'pending' | 'paid' | 'cancelled';
  badge?: string | null;
  total?: number;
  currency?: string;
  invoiceLines?: {
    label: string;
    amount: number;
    isDiscount?: boolean;
  }[];
}
