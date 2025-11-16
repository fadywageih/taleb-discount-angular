// src/app/core/types/auth.types.ts
export interface LoginDto {
  email: string;
  password: string;
}

export interface UserResultDto {
  displayName: string;
  email: string;
  token: string;
  userType: 'Vendor' | 'School' | 'University'| string;
}

export interface ResetPasswordDto {
  email: string;
  token: string;
  password: string;
  confirmPassword: string;
}