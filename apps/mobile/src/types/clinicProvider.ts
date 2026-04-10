export interface ClinicProvider {
  id: string;
  doctorName: string;
  specialty: string;
  price: string;
  clinicName: string;
  description: string;
  hours: string;
  days: string;
  location: string;
  imageUri?: string;
  imageFallbackColor?: string;
}
