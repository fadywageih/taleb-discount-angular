import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../Services/Product/product-service';
import { VendorService } from '../../../Services/vendor/vendor.service';
import { ProductResultDto, VendorDto } from '../../../core';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.html',
  styleUrls: ['./edit-product.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class EditProduct implements OnInit {
  productForm: FormGroup;
  productId: number;
  currentImageUrl: string = 'assets/Images/default-product.jpg';
  selectedFile: File | null = null;
  isSubmitting = false;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  vendorData: VendorDto | null = null;

  categories = [
    { id: 1, name: 'Supplies' },
    { id: 2, name: 'Technology' },
    { id: 3, name: 'Medical' },
    { id: 4, name: 'Engineering' },
    { id: 5, name: 'Workspaces' },
    { id: 6, name: 'Uniform' }
  ];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private vendorService: VendorService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.productId = +this.route.snapshot.params['id'];
    this.productForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadVendorData();
    this.loadProduct();
  }

  loadVendorData(): void {
    this.vendorService.getVendorProfile().subscribe({
      next: (vendor: VendorDto) => {
        this.vendorData = vendor;
      },
      error: (error: any) => {
        console.error('Error loading vendor data:', error);
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      discountPrice: [0, [Validators.min(0)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      categoryId: ['', Validators.required],
      address: ['', [Validators.required, Validators.minLength(5)]],
      restockDueDate: [''],
      isActive: [true]
    });
  }

  loadProduct(): void {
    this.productService.getProductById(this.productId).subscribe({
      next: (product: ProductResultDto) => {
        this.initializeForm(product);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.errorMessage = 'Failed to load product';
        this.isLoading = false;
      }
    });
  }

  private initializeForm(product: ProductResultDto): void {
    this.currentImageUrl = this.getImageUrl(product.pictureUrl || '');

    this.productForm = this.fb.group({
      name: [product.name, [Validators.required, Validators.minLength(3)]],
      description: [product.description, [Validators.required, Validators.minLength(10)]],
      price: [product.price, [Validators.required, Validators.min(0.01)]],
      discountPrice: [product.discountPrice || 0, [Validators.min(0)]],
      quantity: [product.quantity, [Validators.required, Validators.min(0)]],
      categoryId: [this.getCategoryIdFromName(product.categoryName || ''), Validators.required],
      address: [product.address, [Validators.required, Validators.minLength(5)]],
      restockDueDate: [(product as any).restockDueDate ? this.formatDate((product as any).restockDueDate) : ''],
      isActive: [product.isActive]
    });
  }

  private getImageUrl(pictureUrl: string): string {
    if (!pictureUrl) {
      return 'assets/Images/default-product.jpg';
    }

    if (pictureUrl.startsWith('http') || pictureUrl.startsWith('/') || pictureUrl.startsWith('assets/')) {
      return pictureUrl;
    }

    return pictureUrl;
  }

  private getCategoryIdFromName(categoryName: string): number {
    const category = this.categories.find(c => c.name === categoryName);
    return category?.id || 1;
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }
  removeCurrentImage(): void {
    this.currentImageUrl = 'assets/Images/default-product.jpg';
    this.selectedFile = null;
  }

  onSubmit(): void {
    if (this.productForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';
      const formData = new FormData();
      const formValues = this.productForm.value;
      formData.append('id', this.productId.toString());
      formData.append('name', formValues.name || '');
      formData.append('description', formValues.description || '');
      formData.append('price', formValues.price?.toString() || '');
      formData.append('discountPrice', formValues.discountPrice?.toString() || '0');
      formData.append('quantity', formValues.quantity?.toString() || '');
      formData.append('categoryId', formValues.categoryId?.toString() || '');
      formData.append('address', formValues.address || '');
      formData.append('isActive', formValues.isActive?.toString() || 'true');
      if (formValues.restockDueDate) {
        const date = new Date(formValues.restockDueDate);
        formData.append('restockDueDate', date.toISOString().split('T')[0]);
      }
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }
      console.log('📤 Sending update request:');
      console.log('Product ID:', this.productId);
      console.log('Form Data:');
      formData.forEach((value, key) => {
        console.log(`  ${key}: ${value}`);
      });

      this.productService.updateProduct(this.productId, formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.successMessage = 'Product updated successfully!';
          setTimeout(() => {
            this.router.navigate(['/vendor/home']);
          }, 2000);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.message || 'Failed to update product';
          console.error('❌ Update error:', error);

          if (error.error?.error) {
            this.errorMessage = error.error.error;
          }
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
      if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
    }
    return '';
  }
}