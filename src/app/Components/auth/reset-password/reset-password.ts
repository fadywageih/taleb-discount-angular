// src/app/reset-password/reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../../Services/account/account-service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.html',
  imports: [FormsModule, CommonModule, RouterLink],
})
export class ResetPassword implements OnInit {
  resetData = {
    password: '',
    confirmPassword: '',
    email: '',
    token: ''
  };
  
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  fieldErrors: { [key: string]: string } = {};

  constructor(
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get token and email from URL parameters
    this.route.queryParams.subscribe(params => {
      this.resetData.email = params['email'] || '';
      this.resetData.token = params['token'] || '';
      
      if (!this.resetData.email || !this.resetData.token) {
        this.errorMessage = 'Invalid or missing reset parameters';
      }
    });
  }

  validateField(fieldName: string, value: any): string {
    switch (fieldName) {
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== this.resetData.password) return 'Passwords do not match';
        return '';
      
      default:
        return '';
    }
  }

  onFieldChange(fieldName: string, value: any) {
    this.fieldErrors[fieldName] = this.validateField(fieldName, value);
    
    // Also validate confirmPassword when password changes
    if (fieldName === 'password') {
      this.fieldErrors['confirmPassword'] = this.validateField('confirmPassword', this.resetData.confirmPassword);
    }
    
    // Clear messages when user starts typing
    this.errorMessage = '';
  }

  getInputClass(field: any, fieldName: string): string {
    const baseClass = 'w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 bg-white/80 transition-all duration-300';
    
    if ((field.touched || (this.resetData as any)[fieldName]) && this.fieldErrors[fieldName]) {
      return `${baseClass} border-red-400 bg-red-50 focus:ring-red-200`;
    }
    
    if (field.valid && field.touched && !this.fieldErrors[fieldName]) {
      return `${baseClass} border-green-400 bg-green-50 focus:ring-green-200`;
    }
    
    return baseClass;
  }

  isFormValid(): boolean {
    const hasNoFieldErrors = Object.values(this.fieldErrors).every(error => error === '');
    const allFieldsFilled = this.resetData.password.trim() !== '' && 
                           this.resetData.confirmPassword.trim() !== '';
    
    return hasNoFieldErrors && allFieldsFilled;
  }

  onSubmit() {
    if (this.isLoading) return;

    // Validate all fields before submission
    Object.keys(this.resetData).forEach(key => {
      if (key !== 'email' && key !== 'token') {
        this.onFieldChange(key, (this.resetData as any)[key]);
      }
    });

    if (!this.isFormValid()) {
      this.errorMessage = 'Please fix all validation errors before submitting';
      return;
    }

    if (!this.resetData.email || !this.resetData.token) {
      this.errorMessage = 'Invalid reset link. Please request a new password reset.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.accountService.resetPassword(this.resetData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = 'Password has been reset successfully! You can now login with your new password.';
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.error || 'Failed to reset password. The link may have expired.';
      }
    });
  }
}