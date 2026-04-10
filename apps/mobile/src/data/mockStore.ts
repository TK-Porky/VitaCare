import { Category, Drug } from "../types";


export const CATEGORIES: Category[] = [
  {
    id: '1',
    label: 'Gelules',
    imageUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Red_capsule.jpg/320px-Red_capsule.jpg',
  },
  {
    id: '2',
    label: 'Comprimés',
    imageUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/White_Pill.jpg/320px-White_Pill.jpg',
  },
  {
    id: '3',
    label: 'Sirop',
    imageUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Cough_syrup.jpg/320px-Cough_syrup.jpg',
  },
];

export const POPULAR_DRUGS: Drug[] = [
  {
    id: '1',
    category: 'Gelules',
    name: 'Doliprane 500mg',
    price: '2.500 XCFA',
    imageUri: 'https://www.doliprane.fr/wp-content/uploads/2021/03/doliprane-500mg-gelules.jpg',
  },
  {
    id: '2',
    category: 'Gelules',
    name: 'Doliprane 1000mg',
    price: '2.500 XCFA',
    imageUri: 'https://www.doliprane.fr/wp-content/uploads/2021/03/doliprane-1000mg-tabs.jpg',
  },
  {
    id: '3',
    category: 'Comprimés',
    name: 'Paracétamol 500mg',
    price: '1.800 XCFA',
    imageUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/White_Pill.jpg/320px-White_Pill.jpg',
  },
  {
    id: '4',
    category: 'Sirop',
    name: 'Toplexil 150ml',
    price: '3.200 XCFA',
    imageUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Cough_syrup.jpg/320px-Cough_syrup.jpg',
  },
];