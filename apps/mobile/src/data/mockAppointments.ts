import { Appointment } from '../types/appointment';

export const APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    doctorName: 'Dr. Igriss Kakmo',
    avatarUri: 'https://randomuser.me/api/portraits/men/32.jpg',
    motif: 'Démangeaison récurrente au...',
    clinic: 'Clinique Wellstar',
    address: 'Bastos, Yaoundé',
    date: '26 Mars 2026',
    time: '12:00',
    badge: 'Dans 2 jours',
  },
  {
    id: '2',
    doctorName: 'Dr. Igriss Kakmo',
    avatarUri: 'https://randomuser.me/api/portraits/men/32.jpg',
    motif: 'Démangeaison récurrente au...',
    clinic: 'Clinique Wellstar',
    address: 'Bastos, Yaoundé',
    date: '26 Mars 2026',
    time: '12:00',
    badge: null,
  },
  {
    id: '3',
    doctorName: 'Dr. Igriss Kakmo',
    avatarUri: 'https://randomuser.me/api/portraits/men/32.jpg',
    motif: 'Démangeaison récurrente au...',
    clinic: 'Clinique Wellstar',
    address: 'Bastos, Yaoundé',
    date: '26 Mars 2026',
    time: '12:00',
    badge: null,
  },
];

export const PAST_APPOINTMENTS: Appointment[] = [
  {
    id: 'p1',
    doctorName: 'Dr. Kemadjo Thérèse',
    avatarUri: 'https://randomuser.me/api/portraits/women/44.jpg',
    motif: 'Consultation générale',
    clinic: 'Clinique Wellstar',
    address: 'Bastos, Yaoundé',
    date: '10 Janv 2026',
    time: '09:30',
    badge: 'Payé',
  },
  {
    id: 'p2',
    doctorName: 'Dr. Kemadjo Thérèse',
    avatarUri: 'https://randomuser.me/api/portraits/women/44.jpg',
    motif: 'Suivi post-opératoire',
    clinic: 'Clinique Wellstar',
    address: 'Bastos, Yaoundé',
    date: '02 Fév 2026',
    time: '14:00',
    badge: 'En attente de payement',
  },
];
