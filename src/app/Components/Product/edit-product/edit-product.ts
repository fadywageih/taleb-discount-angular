// src/app/Components/Product/edit-product/edit-product.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VendorDto, ProductResultDto } from '../../../core';
import { ProductService } from '../../../Services/Product/product-service';
import { VendorService } from '../../../Services/vendor/vendor.service';

// تعريف الـ Categories الثابتة
const STATIC_CATEGORIES = [
  { id: 1, name: 'Supplies' },
  { id: 2, name: 'Technology' },
  { id: 3, name: 'Medical' },
  { id: 4, name: 'Engineering' },
  { id: 5, name: 'Workspaces' },
  { id: 6, name: 'Uniform' }
];

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.html',
  styleUrls: ['./edit-product.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class EditProduct implements OnInit {
  productForm: FormGroup;
  categories = STATIC_CATEGORIES;
  selectedFile: File | null = null;
  currentImageUrl: string = '';
  isSubmitting = false;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  vendorData: VendorDto | null = null;
  productId!: number;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private vendorService: VendorService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.productForm = this.createForm();
  }

  ngOnInit(): void {
    this.productId = +this.route.snapshot.paramMap.get('id')!;
    this.loadVendorData();
    this.loadProductData();
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

  loadProductData(): void {
    this.isLoading = true;
    this.productService.getProductById(this.productId).subscribe({
      next: (product: ProductResultDto) => {
        console.log('Product data loaded:', product);
        this.populateForm(product);
        this.currentImageUrl = this.getImageUrl(product.pictureUrl);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading product:', error);
        this.errorMessage = 'Failed to load product details';
        this.isLoading = false;
      }
    });
  }

  populateForm(product: ProductResultDto): void {
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || 0,
      quantity: product.quantity,
      categoryId: this.getCategoryIdFromName(product.categoryName),
      address: product.address,
      restockDueDate: product.restockDueDate ? this.formatDate(product.restockDueDate) : '',
      isActive: product.isActive
    });
  }

  getCategoryIdFromName(categoryName: string): number {
    const category = this.categories.find(cat => cat.name === categoryName);
    return category ? category.id : 1; // Default to first category if not found
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath || imagePath.trim() === '') {
      return 'assets/Images/Slider.png';
    }
    
    if (imagePath.startsWith('data:image')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/')) {
      return `https://localhost:7233${imagePath}`;
    }
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    return 'assets/Images/Slider.png';
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

  removeCurrentImage(): void {
    this.currentImageUrl = '';
    this.selectedFile = null;
  }

  onSubmit(): void {
    if (this.productForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = new FormData();
      
      // إضافة الـ ID أولاً
      formData.append('id', this.productId.toString());
      
      // إضافة كل الحقول للـ FormData
      Object.keys(this.productForm.value).forEach(key => {
        const value = this.productForm.value[key];
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value.toString());
        }
      });

      // إضافة الصورة إذا موجودة
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.productService.updateProduct(this.productId, formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.successMessage = 'Product updated successfully!';
          
          setTimeout(() => {
            this.router.navigate(['/vendor/home']);
          }, 2000);
        },
        error: (error: any) => {
          this.isSubmitting = false;
          this.errorMessage = error.message || 'Failed to update product';
          console.error('Error updating product:', error);
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