export type UserRole = 'patient' | 'doctor';

export interface UserProfile {
  id: string;
  clerk_user_id: string;
  role: UserRole;
  full_name: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  created_at: string;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

export interface LabValue {
  id: string;
  name: string;
  value: string;
  unit: string;
  date: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Passport {
  id: string;
  user_id: string;
  passport_code: string;
  blood_group?: string;
  allergies: string[];
  conditions: string[];
  medicines: Medicine[];
  lab_values: LabValue[];
  emergency_contact?: EmergencyContact;
  ai_summary?: string;
  completion_percent: number;
  updated_at: string;
}

export interface UploadedReport {
  id: string;
  passport_id: string;
  file_url: string;
  file_name: string;
  uploaded_at: string;
}

export interface ParsedDocument {
  medicines: { name: string; dosage: string; frequency: string }[];
  conditions: string[];
  labValues: { name: string; value: string; unit: string; date: string }[];
  doctorName: string | null;
  clinicName: string | null;
}
