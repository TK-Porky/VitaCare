import { Category, Drug } from "../types";

export const MARKETPLACE_CATEGORIES : Category[]= [
  {
    id: '1',
    label: 'Gélules',
    imageUri:
      'https://www.pharma-gdd.com/media/cache/resolve/product_show/6e61742d666f726d2d6c2d617267696e696e652d313030306d672d36302d67656c756c65732d666163651dae633e.jpg'
  },
  {
    id: '2',
    label: 'Comprimés',
    imageUri:
      'https://www.pharma-gdd.com/media/cache/resolve/product_show/couvercle-severo-face.jpg'
  },
  {
    id: '3',
    label: 'Sirop',
    imageUri:
      'https://www.pharma-gdd.com/media/cache/resolve/product_show/9424ec37c2618f61005444a311de44e8a1d5073896dba59280d3c2e2ac7dfca6cc1412f2.jpg'
  },
  {
    id: '4',
    label: 'Vitamines',
    imageUri:
      'https://www.pharma-gdd.com/media/cache/resolve/product_show/61626f63612d766974616d696e2d632d6e61747572636f6d706c65782d736163686574732d66616365224b6812.jpg'
  },
  {
    id: '5',
    label: 'Sexualité',
    imageUri:
      'https://www.pharma-gdd.com/media/cache/resolve/product_show/696d672d33323239bffb65af.jpg'
  },
];

export const MARKETPLACE_DRUGS : Drug[]= [
  {
    id: '1',
    category: 'Analgésique',
    name: 'Doliprane 500mg',
    price: '2.500 FCFA',
    imageUri:
      'https://www.pharma-gdd.com/media/cache/resolve/product_show/73616e6f66692d746162732d313030306d672d382d636f6d7072696d65732d66616365804cf675.jpg'
  },
  {
    id: '2',
    category: 'Comprimés',
    name: 'Viatris Paracétamol 1g',
    price: '3.800 FCFA',
    imageUri:
      'https://www.pharma-gdd.com/media/cache/resolve/product_show/766961747269732d70617261636574616d6f6c2d31672d636f6d7072696d652d6661636505288ef7.jpg'
  },
  {
    id: '3',
    category: 'Comprimés',
    name: 'Citrate de Bétahistine USPA 2g',
    price: '1.200 FCFA',
    imageUri:
      'https://www.pharma-gdd.com/media/cache/resolve/product_show/7061636b2d33642d636974726174652d636974726f6e2d31302d3230323226c52f40.jpg'
  },
  {
    id: '4',
    category: 'Sirop',
    name: 'Mucolimax 200ml',
    price: '3.200 FCFA',
    imageUri:
      'https://www.pharma-gdd.com/media/cache/resolve/product_show/6d75636f6d7973742d3230302d736163686574e14a62e5.jpg'
  },
  {
    id: '5',
    category: 'Comprimés',
    name: 'Aspirine UPSA 1000',
    price: '4.500 FCFA',
    imageUri:
      'https://www.pharma-gdd.com/media/cache/resolve/product_show/7061636b2d33642d6173706972696e652d313030302d6566668dc52fcd.jpg'
  },
  {
    id: '6',
    category: 'Comprimés',
    name: 'Vitamine C UPSA 1000',
    price: '2.800 FCFA',
    imageUri:
      'https://www.pharma-gdd.com/media/cache/resolve/product_show/757073612d766974616d696e652d632d313030302d6d672d636f6d7072696d65732d612d63726f717565722d783135acb0b3e5.jpg'
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
