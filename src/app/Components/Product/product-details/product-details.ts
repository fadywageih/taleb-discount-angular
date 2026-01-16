import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../Services/Product/product-service';
import { ProductResultDto } from '../../../core';
import { Header } from '../../../shared/header/header';
import { AccountService } from '../../../Services/account/account-service';
import { TransactionService } from '../../../Services/transaction';
import { TransactionCreateDto } from '../../../core/types/Transaction/TransactionCreateDto';
import { TransactionDto } from '../../../core/types/Transaction/TransactionDto';
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
  private transactionService = inject(TransactionService);
  public router = inject(Router);
  product: ProductResultDto | null = null;
  loading = false;
  error = '';
  quantity = 1;
  showImageZoom = false;
  relatedProducts: ProductResultDto[] = [];
  isCreatingTransaction = false;
  transactionError: string | null = null;

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
  getItNow(): void {
    if (!this.product || this.product.quantity === 0) {
      alert('This product is out of stock!');
      return;
    }
    if (this.quantity > this.product.quantity) {
      alert(`Only ${this.product.quantity} items available!`);
      return;
    }
    const confirmMessage = `Confirm purchase of ${this.quantity} x ${this.product.name} for ${this.getDisplayPrice()}?`;
    if (!confirm(confirmMessage)) {
      return;
    }
    this.isCreatingTransaction = true;
    this.transactionError = null;
    const transactionDto: TransactionCreateDto = {
      productId: this.product.id,
      quantity: this.quantity
    };

    this.transactionService.createTransaction(transactionDto).subscribe({
      next: (transaction: TransactionDto) => {
        console.log('✅ Transaction created successfully:', transaction);
        const successMessage = `🎉 Order Created Successfully!\n\n` +
                              `📋 Transaction ID: ${transaction.transactionNumber}\n` +
                              `📦 Product: ${this.product?.name}\n` +
                              `📊 Quantity: ${this.quantity}\n` +
                              `💰 Total: ${transaction.totalAmount}\n` +
                              `📈 Status: ${transaction.status}\n\n` +
                              `You can track your order in "My Orders" page.`;
        alert(successMessage);
        this.router.navigate(['/user/transactions']);
      },
      error: (error: any) => {
        console.error('❌ Error creating transaction:', error);
        this.transactionError = error.error?.message || 'Failed to create order. Please try again.';
        alert(`❌ ${this.transactionError}`);
        this.isCreatingTransaction = false;
      },
      complete: () => {
        this.isCreatingTransaction = false;
      }
    });
  }
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
  getMainProductImage(): string {
    if (!this.product) {
      return 'assets/Images/default-product.jpg';
    }
    return this.product.pictureUrl || 'assets/Images/default-product.jpg';
  }
  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/Images/default-product.jpg';
  }
  openImageZoom(): void {
    this.showImageZoom = true;
    document.body.style.overflow = 'hidden';
  }
  closeImageZoom(): void {
    this.showImageZoom = false;
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
    const total = price * this.quantity;
    return `$${total.toFixed(2)}`;
  }
  getOriginalPrice(): string {
    if (!this.product || !this.product.discountPrice || this.product.discountPrice >= this.product.price) {
      return '';
    }
    const originalTotal = this.product.price * this.quantity;
    return `$${originalTotal.toFixed(2)}`;
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
      return Math.round(price * 0.1 * this.quantity);
    }
    return 0;
  }
  getStudentPrice(): string {
    if (!this.product) return '$0.00';
    const basePrice = this.product.discountPrice || this.product.price || 0;
    const studentDiscount = this.getStudentDiscount();
    const finalPrice = (basePrice * this.quantity) - studentDiscount;
    return `$${finalPrice.toFixed(2)}`;
  }
}