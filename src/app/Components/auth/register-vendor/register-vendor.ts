import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../../../Services/account/account-service';
import { ValidationService } from '../../../Services/validation/validation.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-vendor',
  templateUrl: './register-vendor.html',
  imports: [FormsModule, CommonModule, RouterLink],
})
export class RegisterVendor {
  registerData = {
    businessName: '',
    email: '',
    phone: '',
    description: '',
    address: '',
    address2: '',
    password: '',
    confirmPassword: '',
    website: '',
    facebookUrl: ''
  };
  
  isLoading = false;
  errorMessage = '';
  fieldErrors: { [key: string]: string } = {};
  checkingEmail = false;
  emailChecked = false;
  emailCheckInProgress = false;

  constructor(
    private accountService: AccountService,
    private validationService: ValidationService,
    private router: Router
  ) {}

  validateField(fieldName: string, value: any): string {
    switch (fieldName) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
        return '';
      
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== this.registerData.password) return 'Passwords do not match';
        return '';
      
      case 'phone':
        if (!value) return 'Phone number is required';
        if (!/^01[0125][0-9]{8}$/.test(value)) return 'Please enter a valid Egyptian phone number';
        return '';
      
      case 'description':
        if (!value) return 'Business description is required';
        if (value.length < 10) return 'Description must be at least 10 characters';
        return '';
      
      case 'website':
        if (value && !/^https?:\/\/.+\..+/.test(value)) return 'Please enter a valid website URL';
        return '';
      
      case 'facebookUrl':
        if (value && !/^https?:\/\/(www\.)?facebook\.com\/.+/.test(value)) return 'Please enter a valid Facebook URL';
        return '';
      
      default:
        if (!value && fieldName !== 'website' && fieldName !== 'facebookUrl' && fieldName !== 'address2') {
          return 'This field is required';
        }
        return '';
    }
  }

  onFieldChange(fieldName: string, value: any) {
    this.fieldErrors[fieldName] = this.validateField(fieldName, value);
    
    // التحقق من الإيميل في الداتا بيز إذا كان صحيحاً
    if (fieldName === 'email' && !this.fieldErrors['email'] && value && !this.emailCheckInProgress) {
      this.checkEmailExists(value);
    }
  }

  async checkEmailExists(email: string) {
    // منع الـ duplicate checks
    if (this.emailCheckInProgress) {
      console.log('Email check already in progress, skipping...');
      return;
    }

    this.emailCheckInProgress = true;
    this.checkingEmail = true;
    this.emailChecked = false;
    
    try {
      const exists = await this.validationService.checkEmailExists(email).toPromise();
      if (exists) {
        this.fieldErrors['email'] = 'This email is already registered. Please use a different email.';
      } else {
        this.fieldErrors['email'] = '';
      }
      this.emailChecked = true;
    } catch (error) {
      console.error('Error checking email:', error);
      this.fieldErrors['email'] = 'Error checking email availability';
      this.emailChecked = true;
    } finally {
      this.checkingEmail = false;
      this.emailCheckInProgress = false;
    }
  }

  getInputClass(field: any, fieldName: string): string {
    const baseClass = 'w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 bg-white transition-all duration-300';
    
    if ((field.touched || (this.registerData as any)[fieldName]) && this.fieldErrors[fieldName]) {
      return `${baseClass} border-red-400 bg-red-50 focus:ring-red-200 focus:border-red-500`;
    }
    
    if (field.valid && field.touched && !this.fieldErrors[fieldName] && !this.checkingEmail) {
      return `${baseClass} border-green-400 bg-green-50 focus:ring-green-200 focus:border-green-500`;
    }
    
    if (fieldName === 'businessName' || fieldName === 'email' || fieldName === 'phone' || fieldName === 'description') {
      return `${baseClass} focus:ring-rose-200 focus:border-rose-500`;
    } else if (fieldName === 'address' || fieldName === 'address2') {
      return `${baseClass} focus:ring-pink-200 focus:border-pink-500`;
    } else if (fieldName === 'website' || fieldName === 'facebookUrl') {
      return `${baseClass} focus:ring-fuchsia-200 focus:border-fuchsia-500`;
    } else {
      return `${baseClass} focus:ring-purple-200 focus:border-purple-500`;
    }
  }

  isFormValid(): boolean {
    const requiredFields = ['businessName', 'email', 'phone', 'description', 'address', 'password', 'confirmPassword'];
    const hasNoFieldErrors = Object.values(this.fieldErrors).every(error => error === '');
    const allRequiredFieldsFilled = requiredFields.every(field => 
      (this.registerData as any)[field] !== null && 
      (this.registerData as any)[field] !== '' && 
      (this.registerData as any)[field] !== undefined
    );
    
    return hasNoFieldErrors && allRequiredFieldsFilled && this.emailChecked && !this.checkingEmail;
  }
  onSubmit() {
    if (this.isLoading) return;
    if (!this.isFormValid()) {
      this.errorMessage = 'Please fix all validation errors before submitting';
      
      const errorFields = Object.keys(this.fieldErrors).filter(key => this.fieldErrors[key] !== '');
      if (errorFields.length > 0) {
        console.log('Fields with errors:', errorFields);
        this.errorMessage += ': ' + errorFields.join(', ');
      }
      
      if (this.checkingEmail) {
        this.errorMessage = 'Please wait for email verification to complete';
      }
      
      if (!this.emailChecked && this.registerData.email && !this.fieldErrors['email']) {
        this.errorMessage = 'Email verification is required. Please wait...';
      }
      
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.accountService.registerVendor(this.registerData).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.router.navigate(['/vendor/home']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Registration error:', error);
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}