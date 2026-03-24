import { Passport, UserProfile } from '@/types';

export const mockUser: UserProfile = {
  id: 'mock-user-1',
  clerk_user_id: 'mock-clerk-1',
  role: 'patient',
  full_name: 'Ramesh Kumar',
  date_of_birth: '1966-01-12',
  gender: 'male',
  created_at: new Date().toISOString(),
};

export const mockPassport: Passport = {
  id: 'mock-passport-1',
  user_id: 'mock-user-1',
  passport_code: 'HP-2947',
  blood_group: 'B+',
  allergies: ['Penicillin', 'Sulfa Drugs', 'Dust'],
  conditions: ['Type 2 Diabetes (2019)', 'Hypertension (2021)'],
  medicines: [
    { id: '1', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
    { id: '2', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
    { id: '3', name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily' },
  ],
  lab_values: [
    { id: '1', name: 'HbA1c', value: '7.8', unit: '%', date: 'Jan 2025' },
    { id: '2', name: 'Blood Pressure', value: '138/88', unit: 'mmHg', date: 'Feb 2025' },
    { id: '3', name: 'Fasting Glucose', value: '124', unit: 'mg/dL', date: 'Mar 2025' },
  ],
  emergency_contact: {
    name: 'Suresh Kumar',
    relationship: 'Son',
    phone: '+91 98765 43210',
  },
  ai_summary:
    'Ramesh is a 58-year-old male with Type 2 Diabetes and Hypertension. Currently on 3 medications. Check allergies before prescribing — allergic to Penicillin and Sulfa Drugs.',
  completion_percent: 72,
  updated_at: new Date().toISOString(),
};
