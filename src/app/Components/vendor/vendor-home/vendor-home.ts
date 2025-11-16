import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VendorService } from '../../../Services/vendor/vendor.service';
import { VendorDto } from '../../../core';
import { VendorHeader } from '../vendor-header/vendor-header';

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  stock: 'in-stock' | 'low-stock' | 'out-of-stock';
  stockText: string;
}

@Component({
  selector: 'app-vendor-home',
  templateUrl: './vendor-home.html',
  imports: [CommonModule, FormsModule, VendorHeader]
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

  currentSlide = 0;
  private slideInterval: any;
  searchTerm = '';
  showDeleteModal = false;
  productToDelete: number | null = null;
  isLoading = true;

  defaultSliderImage = 'assets/Images/Slider.png';

  products: Product[] = [
    {
      id: 1,
      name: 'Wireless Headphones',
      category: 'Electronics',
      description: 'Premium noise-cancelling wireless headphones',
      price: 79.99,
      image: 'assets/images/product-1.png',
      stock: 'in-stock',
      stockText: 'In Stock'
    },
    {
      id: 2,
      name: 'Smart Coffee Maker',
      category: 'Home & Kitchen',
      description: 'Programmable coffee maker with app control',
      price: 129.99,
      image: 'assets/images/product-2.png',
      stock: 'low-stock',
      stockText: 'Only 3 Left'
    }
  ];

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

  get productToDeleteName(): string {
    if (!this.productToDelete) return '';
    const product = this.products.find(p => p.id === this.productToDelete);
    return product ? product.name : '';
  }

  constructor(
    private vendorService: VendorService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadVendorData();
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
        this.isLoading = false;
      }
    });
  }

  goToEdit(): void {
    this.router.navigate(['/vendor/edit']);
  }

  // Slider Methods
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
    // Search logic here
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
      this.products = this.products.filter(product => product.id !== this.productToDelete);
      this.showDeleteModal = false;
      this.productToDelete = null;
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  editProduct(productId: number): void {
    // Edit product logic
  }

  // Utility Methods
  getStockColor(stockStatus: string): string {
    switch (stockStatus) {
      case 'in-stock': return 'text-green-600';
      case 'low-stock': return 'text-yellow-600';
      case 'out-of-stock': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  getStockIcon(stockStatus: string): string {
    switch (stockStatus) {
      case 'in-stock': return 'fa-check-circle';
      case 'low-stock': return 'fa-exclamation-circle';
      case 'out-of-stock': return 'fa-times-circle';
      default: return 'fa-question-circle';
    }
  }

  get filteredProducts(): Product[] {
    if (!this.searchTerm.trim()) {
      return this.products;
    }
    const term = this.searchTerm.toLowerCase();
    return this.products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term)
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
}