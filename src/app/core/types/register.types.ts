// src/app/core/types/register.types.ts
export interface SchoolRegisterDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  nationalId: string;
  age: number | null;  
  level: number | null;
  schoolName: string;
  phone: string;
  birthCertificateFile: File;
}

export interface VendorRegisterDto {
  businessName: string;
  email: string;
  phone: string;
  description: string;
  address: string;
  address2?: string;
  password: string;
  confirmPassword: string;
  website?: string;
  facebookUrl?: string;
}

export interface UniversityRegisterDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  nationalId: string;
  age: number | null;  
  level: number | null;
  universityName: string;
  faculty: string;
  universityEmail: string;
  phone: string;
  nationalIdFile: File;
}