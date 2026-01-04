import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FeedBackCreateDto, FeedBackService } from '../../Services/feedback/feed-back';
import { AccountService } from '../../Services/account/account-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.html',
  styleUrls: ['./feedback.css'],
  standalone: true, 
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    
  ]
})
export class Feedback implements OnInit {
  feedbackForm: FormGroup;
  isSubmitting = false;
  showSuccess = false;
  currentUser: any = null;
  selectedRating = 0;
  hoverRating = 0;
  errorMessage = '';

  categories = [
    { value: 'Vendor', label: 'Vendor' },
    { value: 'Product', label: 'Product' },
    { value: 'Website', label: 'Website' }
  ];

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedBackService,
    private accountService: AccountService,
    private router: Router
  ) {
    this.feedbackForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      category: ['Vendor', Validators.required],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      suggestions: ['']
    });
  }

  ngOnInit(): void {
    // الحصول على المستخدم الحالي
    this.accountService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
        console.log('Current user in feedback:', user);
        
        if (user?.email) {
          this.feedbackForm.patchValue({ email: user.email });
        }
      },
      error: (error) => {
        console.error('Error getting current user:', error);
      }
    });
    const storedUser = this.accountService.getCurrentUser();
    if (storedUser?.email && !this.currentUser) {
      this.currentUser = storedUser;
      this.feedbackForm.patchValue({ email: storedUser.email });
    }
  }
  setRating(rating: number): void {
    this.selectedRating = rating;
    this.hoverRating = rating;
    this.feedbackForm.patchValue({ rating });
  }
  setHoverRating(rating: number): void {
    this.hoverRating = rating;
  }
  clearHoverRating(): void {
    this.hoverRating = this.selectedRating;
  }
  onSubmit(): void {
    if (this.feedbackForm.invalid) {
      this.markFormGroupTouched(this.feedbackForm);
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';
    const feedbackData: FeedBackCreateDto = {
      email: this.feedbackForm.get('email')?.value,
      category: this.feedbackForm.get('category')?.value,
      rating: this.feedbackForm.get('rating')?.value,
      suggestions: this.feedbackForm.get('suggestions')?.value
    };
    console.log('Submitting feedback:', feedbackData);
    this.feedbackService.createFeedBack(feedbackData).subscribe({
      next: (response) => {
        console.log('Feedback submitted successfully:', response);
        this.showSuccess = true;
        this.isSubmitting = false;
        setTimeout(() => {
          this.resetForm();
        }, 3000);
      },
      error: (error) => {
        console.error('Error submitting feedback:', error);
        if (error.status === 400) {
          this.errorMessage = error.error?.error || 'بيانات غير صحيحة. الرجاء التحقق من المعلومات.';
        } else if (error.status === 500) {
          this.errorMessage = 'حدث خطأ في الخادم. الرجاء المحاولة لاحقاً.';
        } else {
          this.errorMessage = error.error?.error || 'حدث خطأ أثناء إرسال التعليقات. حاول مرة أخرى.';
        }
        this.isSubmitting = false;
      }
    });
  }
  resetForm(): void {
    this.feedbackForm.reset({
      category: 'Vendor',
      rating: 0,
      suggestions: ''
    });
    this.selectedRating = 0;
    this.hoverRating = 0;
    this.showSuccess = false;
    if (this.currentUser?.email) {
      this.feedbackForm.patchValue({ email: this.currentUser.email });
    }
  }
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  goBack(): void {
    this.router.navigate(['/home']);
  }
  isUserLoggedIn(): boolean {
    return this.accountService.isLoggedIn();
  }
  getUserType(): string | null {
    return this.accountService.getUserType();
  }
}