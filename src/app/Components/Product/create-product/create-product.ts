import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VendorDto } from '../../../core';
import { ProductService } from '../../../Services/Product/product-service';
import { VendorService } from '../../../Services/vendor/vendor.service';
const STATIC_CATEGORIES = [
  { id: 1, name: 'Supplies' },
  { id: 2, name: 'Technology' },
  { id: 3, name: 'Medical' },
  { id: 4, name: 'Engineering' },
  { id: 5, name: 'Workspaces' },
  { id: 6, name: 'Uniform' }
];
@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.html',
  styleUrls: ['./create-product.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CreateProduct implements OnInit {
  productForm: FormGroup;
  categories = STATIC_CATEGORIES;
  selectedFile: File | null = null;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  vendorData: VendorDto | null = null;
  constructor(
    private fb: FormBuilder,
    @Inject(ProductService) private productService: ProductService,
    @Inject(VendorService) private vendorService: VendorService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.productForm = this.createForm();
  }
  ngOnInit(): void {
    this.loadVendorData();
  }
  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      discountPrice: [0, [Validators.min(0)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      categoryId: ['', Validators.required],
      address: ['', [Validators.required, Validators.minLength(5)]],
      restockDueDate: [''],
      isActive: [true]
    });
  }
  loadVendorData(): void {
    this.vendorService.getVendorProfile().subscribe({
      next: (vendor: VendorDto) => {
        this.vendorData = vendor;
      },
      error: (error: any) => {
        console.error('Error loading vendor data:', error);
        this.errorMessage = 'Failed to load vendor information';
      }
    });
  }
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Please select a valid image file (JPEG, PNG, GIF, WebP)';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size should be less than 5MB';
        return;
      }
      this.selectedFile = file;
      this.errorMessage = '';
    }
  }
  onSubmit(): void {
    if (this.productForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';
      const formData = new FormData();
      Object.keys(this.productForm.value).forEach(key => {
        const value = this.productForm.value[key];
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value.toString());
        }
      });
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }
      this.productService.createProduct(formData).subscribe({
        next: (product: any) => {
          this.isSubmitting = false;
          this.successMessage = 'Product created successfully!';
          
          setTimeout(() => {
            this.router.navigate(['/vendor/home']);
          }, 2000);
        },
        error: (error: any) => {
          this.isSubmitting = false;
          this.errorMessage = error.message || 'Failed to create product';
          console.error('Error creating product:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }
  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      this.productForm.get(key)?.markAsTouched();
    });
  }
  onCancel(): void {
    this.router.navigate(['/vendor/home']);
  }
  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength}`;
      if (field.errors['maxlength']) return `Maximum length is ${field.errors['maxlength'].requiredLength}`;
      if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
    }
    return '';
  }
  
}