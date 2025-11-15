// src/app/forgot-password/forgot-password.component.ts
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../../Services/account/account-service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.html',
  imports: [FormsModule, CommonModule, RouterLink],
})
export class ForgotPassword {
  email = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  fieldErrors: { [key: string]: string } = {};

  constructor(
    private accountService: AccountService,
    private router: Router
  ) {}

  validateField(fieldName: string, value: any): string {
    switch (fieldName) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
        return '';
      
      default:
        return '';
    }
  }

  onFieldChange(fieldName: string, value: any) {
    this.fieldErrors[fieldName] = this.validateField(fieldName, value);
    // Clear messages when user starts typing
    this.successMessage = '';
    this.errorMessage = '';
  }

  getInputClass(field: any, fieldName: string): string {
    const baseClass = 'w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 bg-white/80 transition-all duration-300';
    
    if ((field.touched || this.email) && this.fieldErrors[fieldName]) {
      return `${baseClass} border-red-400 bg-red-50 focus:ring-red-200`;
    }
    
    if (field.valid && field.touched && !this.fieldErrors[fieldName]) {
      return `${baseClass} border-green-400 bg-green-50 focus:ring-green-200`;
    }
    
    return baseClass;
  }

  isFormValid(): boolean {
    return !this.fieldErrors['email'] && this.email.trim() !== '';
  }

  onSubmit() {
    if (this.isLoading) return;

    // Validate before submission
    this.onFieldChange('email', this.email);

    if (!this.isFormValid()) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.accountService.forgotPassword(this.email).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = 'If your email is registered, you will receive a password reset link shortly.';
        this.email = ''; // Clear the form
      },
      error: (error) => {
        this.isLoading = false;
        // Always show success message for security reasons
        this.successMessage = 'If your email is registered, you will receive a password reset link shortly.';
        this.email = ''; // Clear the form anyway
      }
    });
  }
}