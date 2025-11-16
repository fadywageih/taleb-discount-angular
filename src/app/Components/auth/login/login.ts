import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../../Services/account/account-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  imports: [FormsModule, CommonModule, RouterLink],
})
export class Login {
  loginDto = {
    email: '',
    password: ''
  };
  
  isLoading = false;
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
      
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      
      default:
        return '';
    }
  }

  onFieldChange(fieldName: string, value: any) {
    this.fieldErrors[fieldName] = this.validateField(fieldName, value);
  }

  getInputClass(field: any, fieldName: string): string {
    const baseClass = 'w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 bg-white/80 transition-all duration-300';
    
    if ((field.touched || (this.loginDto as any)[fieldName]) && this.fieldErrors[fieldName]) {
      return `${baseClass} border-red-400 bg-red-50 focus:ring-red-200`;
    }
    
    if (field.valid && field.touched && !this.fieldErrors[fieldName]) {
      return `${baseClass} border-green-400 bg-green-50 focus:ring-green-200`;
    }
    
    return baseClass;
  }

  isFormValid(): boolean {
    // تحقق أن جميع الحقول ليس بها أخطاء (الرسائل فارغة)
    const hasNoFieldErrors = Object.values(this.fieldErrors).every(error => error === '');
    
    // تحقق أن جميع الحقول مملوءة
    const allFieldsFilled = this.loginDto.email.trim() !== '' && this.loginDto.password.trim() !== '';
    
    return hasNoFieldErrors && allFieldsFilled;
  }

  onSubmit() {
    if (this.isLoading) return;

    // Validate all fields before submission
    Object.keys(this.loginDto).forEach(key => {
      this.onFieldChange(key, (this.loginDto as any)[key]);
    });

    if (!this.isFormValid()) {
      this.errorMessage = 'Please fix all validation errors before submitting';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.accountService.login(this.loginDto).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        // تحديد الصفحة المناسبة بناءً على نوع المستخدم
        this.redirectBasedOnUserType(response);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Login failed. Please check your Email or Password.';
        this.isLoading = false;
      }
    });
  }

  private redirectBasedOnUserType(user: any): void {
    const userType = user?.userType || this.accountService.getUserType();
    
    switch (userType) {
      case 'Vendor':
        this.router.navigate(['/vendor/home']);
        break;
      case 'School':
      case 'University':
      default:
        this.router.navigate(['/home']);
        break;
    }
  }
}