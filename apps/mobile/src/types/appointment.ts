export interface Appointment {
  id: string;
  doctorName: string;
  avatarUri: string;
  motif: string;
  clinic: string;
  address: string;
  date: string;
  time: string;
  badge?: string | null;
}
