export interface Drug {
  id: string;
  name: string;
  category?: string;
  price?: number;
  imageUri?: string;
  dosage?: string;
  description?: string;
  manufacturer?: string;
  requiresPrescription?: boolean;
  stock?: number;
}
