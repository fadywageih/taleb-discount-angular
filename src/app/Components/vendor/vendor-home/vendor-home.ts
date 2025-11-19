// src/app/Components/vendor/vendor-home/vendor-home.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { VendorService } from '../../../Services/vendor/vendor.service';
import { ProductService } from '../../../Services/Product/product-service';
import { VendorDto, ProductResultDto } from '../../../core';
import { VendorHeader } from '../vendor-header/vendor-header';

@Component({
  selector: 'app-vendor-home',
  templateUrl: './vendor-home.html',
  styleUrls: ['./vendor-home.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, VendorHeader]
})
export class VendorHome implements OnInit, OnDestroy {
  vendorData: VendorDto = {
    id: '',
    businessName: '',
    description: '',
    address: '',
    address2: '',
    website: '',
    facebookUrl: '',
    logoUrl: '',
    businessImages: [],
    userId: '',
    branches: []
  };

  products: ProductResultDto[] = [];
  currentSlide = 0;
  private slideInterval: any;
  searchTerm = '';
  showDeleteModal = false;
  productToDelete: number | null = null;
  isLoading = true;
  productsLoading = true;
  errorMessage = '';

  defaultSliderImage = 'assets/Images/Slider.png';

  constructor(
    private vendorService: VendorService,
    private productService: ProductService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadVendorData();
    this.loadVendorProducts();
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  loadVendorData() {
    this.isLoading = true;
    this.vendorService.getVendorProfile().subscribe({
      next: (data) => {
        this.vendorData = { 
          ...data,
          businessImages: data.businessImages || [] 
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading vendor data:', error);
        this.errorMessage = error.message;
        this.isLoading = false;
      }
    });
  }

  loadVendorProducts() {
    this.productsLoading = true;
    this.productService.getVendorProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.productsLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.errorMessage = error.message;
        this.productsLoading = false;
      }
    });
  }

  addProduct(): void {
    this.router.navigate(['/vendor/products/create']);
  }

  goToEdit(): void {
    this.router.navigate(['/vendor/edit']);
  }

  // Slider Methods - نفس الكود اللي عندك
  get sliderImages(): string[] {
    if (this.hasVendorImages) {
      const validImages = (this.vendorData.businessImages || [])
        .filter(img => img && img.trim() !== '')
        .slice(0, 5);
      return validImages;
    }
    return new Array(5).fill(this.defaultSliderImage);
  }

  get hasVendorImages(): boolean {
    const businessImages = this.vendorData.businessImages || [];
    return businessImages.length > 0 && businessImages.some(img => img && img.trim() !== '');
  }

  startAutoSlide(): void {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  stopAutoSlide(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  nextSlide(): void {
    if (this.sliderImages.length > 0) {
      this.currentSlide = (this.currentSlide + 1) % this.sliderImages.length;
    }
  }

  previousSlide(): void {
    if (this.sliderImages.length > 0) {
      this.currentSlide = (this.currentSlide - 1 + this.sliderImages.length) % this.sliderImages.length;
    }
  }

  goToSlide(index: number): void {
    if (index >= 0 && index < this.sliderImages.length) {
      this.currentSlide = index;
    }
  }

  getSlideClasses(index: number): string {
    const baseClasses = 'absolute inset-0 transition-all duration-700 ease-in-out transform';
    if (index === this.currentSlide) {
      return `${baseClasses} translate-x-0 opacity-100 z-10`;
    }
    return `${baseClasses} translate-x-full opacity-0 z-0`;
  }

  getIndicatorClasses(index: number): string {
    const baseClasses = 'w-4 h-4 rounded-full transition-all duration-300 cursor-pointer border-2 border-white';
    return index === this.currentSlide
      ? `${baseClasses} bg-white scale-110`
      : `${baseClasses} bg-white/30`;
  }

  // Search Methods
  onSearch(): void {
    // Search logic
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  // Product Methods
  deleteProduct(productId: number): void {
    this.productToDelete = productId;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.productToDelete) {
      this.productService.deleteProduct(this.productToDelete).subscribe({
        next: () => {
          this.products = this.products.filter(product => product.id !== this.productToDelete);
          this.showDeleteModal = false;
          this.productToDelete = null;
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.errorMessage = error.message;
          this.showDeleteModal = false;
          this.productToDelete = null;
        }
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  editProduct(productId: number): void {
    this.router.navigate(['/vendor/products/edit', productId]);
  }

  // Utility Methods
  getStockStatus(product: ProductResultDto): { status: string, text: string, color: string, icon: string } {
    if (product.quantity > 10) {
      return { 
        status: 'in-stock', 
        text: 'In Stock', 
        color: 'text-green-600', 
        icon: 'fa-check-circle' 
      };
    } else if (product.quantity > 0) {
      return { 
        status: 'low-stock', 
        text: `Only ${product.quantity} Left`, 
        color: 'text-yellow-600', 
        icon: 'fa-exclamation-circle' 
      };
    } else {
      return { 
        status: 'out-of-stock', 
        text: 'Out of Stock', 
        color: 'text-red-600', 
        icon: 'fa-times-circle' 
      };
    }
  }

  get filteredProducts(): ProductResultDto[] {
    if (!this.searchTerm.trim()) {
      return this.products;
    }
    const term = this.searchTerm.toLowerCase();
    return this.products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.categoryName.toLowerCase().includes(term)
    );
  }

  handleImageError(event: any, index: number) {
    if (event.target.src.startsWith('data:image')) {
      return;
    }
    event.target.src = this.defaultSliderImage;
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath || imagePath.trim() === '') {
      return this.defaultSliderImage;
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
    
    return this.defaultSliderImage;
  }

  get productToDeleteName(): string {
    if (!this.productToDelete) return '';
    const product = this.products.find(p => p.id === this.productToDelete);
    return product ? product.name : '';
  }
} 