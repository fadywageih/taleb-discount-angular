// src/app/Components/auth/register-school/register-school.component.ts
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../../../Services/account/account-service';
import { ValidationService } from '../../../Services/validation/validation.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-school',
  templateUrl: './register-school.html',
  imports: [FormsModule, CommonModule, RouterLink],
})
export class RegisterSchool {
  registerData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    nationalId: '',
    age: null as number | null,
    level: null as number | null,
    schoolName: '',
    phone: '',
    birthCertificateFile: new File([], 'empty') 
  };
  
  isLoading = false;
  errorMessage = '';
  fieldErrors: { [key: string]: string } = {};
  checkingEmail = false;
  emailChecked = false;
  emailCheckInProgress = false; // علشان نمنع الـ duplicate checks

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
      
      case 'age':
        if (!value) return 'Age is required';
        if (value < 6 || value > 25) return 'Age must be between 6 and 25';
        return '';
      
      case 'level':
        if (!value) return 'Grade level is required';
        if (value < 1 || value > 12) return 'Grade level must be between 1 and 12';
        return '';
      
      case 'phone':
        if (!value) return 'Phone number is required';
        if (!/^01[0125][0-9]{8}$/.test(value)) return 'Please enter a valid Egyptian phone number';
        return '';
      
      case 'nationalId':
        if (!value) return 'National ID is required';
        if (!/^[0-9]{14}$/.test(value)) return 'National ID must be 14 digits';
        return '';
      
      default:
        if (!value) return 'This field is required';
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
    
    if (field.valid && field.touched && !this.fieldErrors['email'] && !this.checkingEmail) {
      return `${baseClass} border-green-400 bg-green-50 focus:ring-green-200 focus:border-green-500`;
    }
    
    if (fieldName === 'name' || fieldName === 'email' || fieldName === 'nationalId' || fieldName === 'phone' || fieldName === 'age') {
      return `${baseClass} focus:ring-blue-200 focus:border-blue-500`;
    } else if (fieldName === 'schoolName' || fieldName === 'level' || fieldName === 'address') {
      return `${baseClass} focus:ring-indigo-200 focus:border-indigo-500`;
    } else {
      return `${baseClass} focus:ring-purple-200 focus:border-purple-500`;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      const maxSize = 5 * 1024 * 1024;
      
      if (!validTypes.includes(file.type)) {
        this.fieldErrors['birthCertificateFile'] = 'Please upload PDF, JPG, or PNG files only';
        return;
      }
      
      if (file.size > maxSize) {
        this.fieldErrors['birthCertificateFile'] = 'File size must be less than 5MB';
        return;
      }
      
      this.registerData.birthCertificateFile = file;
      this.fieldErrors['birthCertificateFile'] = '';
    }
  }

  isFormValid(): boolean {
    const hasNoFieldErrors = Object.values(this.fieldErrors).every(error => error === '');
    
    const allRequiredFieldsFilled = 
      this.registerData.name?.trim() !== '' &&
      this.registerData.email?.trim() !== '' &&
      this.registerData.password?.trim() !== '' &&
      this.registerData.confirmPassword?.trim() !== '' &&
      this.registerData.address?.trim() !== '' &&
      this.registerData.nationalId?.trim() !== '' &&
      this.registerData.age !== null && this.registerData.age !== undefined && this.registerData.age > 0 &&
      this.registerData.level !== null && this.registerData.level !== undefined && this.registerData.level > 0 &&
      this.registerData.schoolName?.trim() !== '' &&
      this.registerData.phone?.trim() !== '' &&
      this.registerData.birthCertificateFile !== null &&
      this.registerData.birthCertificateFile.size > 0;

    return hasNoFieldErrors && allRequiredFieldsFilled && this.emailChecked && !this.checkingEmail;
  }

  onSubmit() {
    if (this.isLoading) return;

    console.log('=== BEFORE SUBMISSION ===');
    console.log('Email checked:', this.emailChecked);
    console.log('Checking email:', this.checkingEmail);
    console.log('Form valid:', this.isFormValid());

    // بدل ما نعمل validation تاني، نستخدم الـ state الحالي
    if (!this.isFormValid()) {
      this.errorMessage = 'Please fix all validation errors before submitting';
      
      const errorFields = Object.keys(this.fieldErrors).filter(key => this.fieldErrors[key] !== '');
      if (errorFields.length > 0) {
        console.log('Fields with errors:', errorFields);
        this.errorMessage += ': ' + errorFields.join(', ');
      }
      
      // إذا المشكلة إن الـ email check مازال شغال
      if (this.checkingEmail) {
        this.errorMessage = 'Please wait for email verification to complete';
      }
      
      // إذا المشكلة إن الـ email check ماعملش بعد
      if (!this.emailChecked && this.registerData.email && !this.fieldErrors['email']) {
        this.errorMessage = 'Please wait for email verification to complete';
      }
      
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    console.log('Submitting form...');

    this.accountService.registerSchool(this.registerData).subscribe({
      next: (user) => {
        this.isLoading = false;
        console.log('Registration successful:', user);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration error:', error);
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}