import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../Services/Product/product-service';
import { ProductResultDto } from '../../../core';
import { Header } from '../../../shared/header/header';
import { AccountService } from '../../../Services/account/account-service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Header],
  templateUrl: './product-details.html',
  styleUrls: ['./product-details.css']
})
export class ProductDetails implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private accountService = inject(AccountService);
  
  public router = inject(Router);
  
  product: ProductResultDto | null = null;
  loading = false;
  error = '';
  quantity = 1;
  
  // متغير للتحكم في zoom الصورة
  showImageZoom = false;

  // لم نعد نحتاج لمصفوفة الصور
  // removed: productImages: string[] = [];
  
  relatedProducts: ProductResultDto[] = [];

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      if (productId) {
        this.loadProductDetails(productId);
      }
    });
  }

  loadProductDetails(productId: string): void {
    this.loading = true;
    this.error = '';
    
    this.productService.getProductById(parseInt(productId)).subscribe({
      next: (product) => {
        this.product = product;
        
        // لم نعد نحتاج لإعداد مصفوفة الصور
        // removed: this.productImages = [...]
        
        this.loadRelatedProducts(product.categoryId);
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error loading product details:', err);
        this.error = 'Failed to load product details. Please try again.';
        this.loading = false;
      }
    });
  }

  // دالة للحصول على الصورة الرئيسية
  getMainProductImage(): string {
    if (!this.product) {
      return 'assets/Images/default-product.jpg';
    }
    return this.product.pictureUrl || 'assets/Images/default-product.jpg';
  }

  // دالة معالجة خطأ الصورة
  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/Images/default-product.jpg';
  }

  // فتح zoom للصورة
  openImageZoom(): void {
    this.showImageZoom = true;
    // منع التمرير عند فتح الـ zoom
    document.body.style.overflow = 'hidden';
  }

  // إغلاق zoom الصورة
  closeImageZoom(): void {
    this.showImageZoom = false;
    // إعادة التمرير
    document.body.style.overflow = 'auto';
  }

  loadRelatedProducts(categoryId: number): void {
    const params = {
      CategoryId: categoryId,
      PageIndex: 1,
      PageSize: 4
    };
    
    this.productService.getAllProducts(params).subscribe({
      next: (response) => {
        this.relatedProducts = response.data 
          ? response.data.filter(p => p.id !== this.product?.id).slice(0, 4)
          : [];
      },
      error: (err) => {
        console.error('❌ Error loading related products:', err);
      }
    });
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.quantity) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (!this.product || this.product.quantity === 0) return;
    
    console.log('Adding to cart:', {
      productId: this.product.id,
      quantity: this.quantity,
      product: this.product
    });
    
    alert(`Added ${this.quantity} of ${this.product.name} to cart!`);
  }

  shareProduct(): void {
    if (!this.product) return;
    
    const shareUrl = `${window.location.origin}/products/${this.product.id}`;
    const shareText = `Check out ${this.product.name} - ${this.product.description?.substring(0, 100)}...`;
    
    if (navigator.share) {
      navigator.share({
        title: this.product.name,
        text: shareText,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  calculateDiscountPercentage(): number {
    if (!this.product || !this.product.price || this.product.price === 0) return 0;
    if (!this.product.discountPrice || this.product.discountPrice >= this.product.price) return 0;
    return Math.round(((this.product.price - this.product.discountPrice) / this.product.price) * 100);
  }

  getDisplayPrice(): string {
    if (!this.product) return '$0.00';
    const price = this.product.discountPrice || this.product.price || 0;
    return `$${price.toFixed(2)}`;
  }

  getOriginalPrice(): string {
    if (!this.product || !this.product.discountPrice || this.product.discountPrice >= this.product.price) {
      return '';
    }
    return `$${this.product.price.toFixed(2)}`;
  }

  getStockStatus(): string {
    if (!this.product) return 'Unknown';
    const quantity = this.product.quantity || 0;
    
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 5) return 'Low Stock';
    if (quantity <= 10) return 'Limited Stock';
    return 'In Stock';
  }

  getStockColor(): string {
    if (!this.product) return 'bg-gray-100 text-gray-600';
    const quantity = this.product.quantity || 0;
    
    if (quantity === 0) return 'bg-red-100 text-red-600';
    if (quantity <= 5) return 'bg-yellow-100 text-yellow-600';
    if (quantity <= 10) return 'bg-orange-100 text-orange-600';
    return 'bg-green-100 text-green-600';
  }

  get isStudent(): boolean {
    const userType = this.accountService.getCurrentUser()?.userType || '';
    return userType === 'School' || userType === 'University';
  }

  getStudentDiscount(): number {
    if (this.isStudent && this.product) {
      const price = this.product.discountPrice || this.product.price;
      return Math.round(price * 0.1);
    }
    return 0;
  }

  getStudentPrice(): string {
    if (!this.product) return '$0.00';
    
    const basePrice = this.product.discountPrice || this.product.price || 0;
    const studentDiscount = this.getStudentDiscount();
    const finalPrice = basePrice - studentDiscount;
    
    return `$${finalPrice.toFixed(2)}`;
  }
}