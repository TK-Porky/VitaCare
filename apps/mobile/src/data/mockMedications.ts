import { Category, Drug } from "../types";

export const MARKETPLACE_CATEGORIES: Category[] = [
  {
    id: '1',
    label: 'Gelules',
    imageUri: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300',
  },
  {
    id: '2',
    label: 'Comprimés',
    imageUri: 'https://images.unsplash.com/photo-1550572017-ed200f545dec?w=300',
  },
  {
    id: '3',
    label: 'Sirop',
    imageUri: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=300',
  },
  {
    id: '4',
    label: 'Vitamines',
    imageUri: 'https://images.unsplash.com/photo-1559130464-473ffc21bcdd?w=300',
  },
  {
    id: '5',
    label: 'Premiers soins',
    imageUri: 'https://images.unsplash.com/photo-1603398938378-e54eab446ddd?w=300',
  },
];

export const MARKETPLACE_DRUGS: Drug[] = [
  {
    id: '1',
    category: 'Analgésique',
    name: 'Doliprane 500mg',
    price: '2.500 XCFA',
    imageUri: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
  },
  {
    id: '2',
    category: 'Antibiotique',
    name: 'Amoxicilline 500mg',
    price: '3.800 XCFA',
    imageUri: 'https://images.unsplash.com/photo-1550572017-ed200f545dec?w=400',
  },
  {
    id: '3',
    category: 'Anti-inflammatoire',
    name: 'Ibuprofène 400mg',
    price: '1.200 XCFA',
    imageUri: 'https://images.unsplash.com/photo-1471864190281-ad5fe9bb0724?w=400',
  },
  {
    id: '4',
    category: 'Sirop',
    name: 'Toplexil 150ml',
    price: '3.200 XCFA',
    imageUri: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=400',
  },
  {
    id: '5',
    category: 'Vitamines',
    name: 'Vitamine C 1000mg',
    price: '4.500 XCFA',
    imageUri: 'https://images.unsplash.com/photo-1559130464-473ffc21bcdd?w=400',
  },
  {
    id: '6',
    category: 'Digestion',
    name: 'Gaviscon 250ml',
    price: '2.800 XCFA',
    imageUri: 'https://images.unsplash.com/photo-1603398938378-e54eab446ddd?w=400',
  },
];

export const MOCK_REMINDERS = [
  {
    id: "1",
    drugName: "Doliprane",
    form: "Gelule",
    dosageValue: "500",
    dosageUnit: "mg",
    frequencyUnit: "Jour",
    frequencyCount: "1",
    intervalDays: "0",
    time: "08:30",
  },
  {
    id: "2",
    drugName: "Amoxicilline",
    form: "Comprimé",
    dosageValue: "500",
    dosageUnit: "mg",
    frequencyUnit: "Jour",
    frequencyCount: "2",
    intervalDays: "0",
    time: "20:00",
  },
];
