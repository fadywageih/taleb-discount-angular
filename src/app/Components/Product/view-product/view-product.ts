// src/app/components/products/view-product.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { ProductResultDto } from '../../../core';
import { HomeService } from '../../../Services/home/home-service';
import { AccountService } from '../../../Services/account/account-service';
import { Header } from '../../../shared/header/header';

@Component({
  selector: 'app-view-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Header],
  templateUrl: './view-product.html', 
  styleUrls: ['./view-product.css']   
})
export class ViewProduct implements OnInit, OnDestroy {
  private homeService = inject(HomeService);
  private accountService = inject(AccountService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();
  products: ProductResultDto[] = [];
  filteredProducts: ProductResultDto[] = [];
  categories: any[] = [];
  loading = false;
  error = '';
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;
  totalItems = 0;
  searchTerm = '';
  selectedCategory = 'all';
  sortBy = 'newest';
  priceRange = { min: 0, max: 10000 };
  private searchSubject = new Subject<string>();
  ngOnInit(): void {
    this.loadCategories();
    this.setupSearch();
    this.listenToQueryParams();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private listenToQueryParams(): void {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.selectedCategory = params['category'] || 'all';
      this.searchTerm = params['search'] || '';
      this.currentPage = params['page'] ? parseInt(params['page']) : 1;
      this.loadProducts();
    });
  }
  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 1;
      this.updateQueryParams();
    });
  }
  loadCategories(): void {
    const user = this.accountService.getCurrentUser();
    const service$ = user?.userType === 'School' || user?.userType === 'University'
      ? this.homeService.getStudentHomePageData()
      : this.homeService.getHomePageData();

    service$.subscribe({
      next: (data) => {
        this.categories = data.categories;
      },
      error: (err) => {
        console.error('❌ Error loading categories:', err);
      }
    });
  }
  loadProducts(): void {
    this.loading = true;
    this.error = '';

    const params = {
      page: this.currentPage,
      pageSize: this.itemsPerPage,
      categoryId: this.selectedCategory !== 'all' ? this.selectedCategory : undefined,
      searchTerm: this.searchTerm || undefined,
      sortBy: this.sortBy,
      minPrice: this.priceRange.min,
      maxPrice: this.priceRange.max
    };

    this.homeService.getAllProductsForStudents(params).subscribe({
      next: (response) => {
        this.products = response.data || response;
        this.filteredProducts = this.applyFilters(this.products);
        this.totalItems = response.totalCount || this.products.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error loading products:', err);
        this.error = 'Failed to load products. Please try again.';
        this.loading = false;
      }
    });
  }
  applyFilters(products: ProductResultDto[]): ProductResultDto[] {
    let filtered = [...products];
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.categoryId?.toString() === this.selectedCategory
      );
    }
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term) ||
        product.categoryName?.toLowerCase().includes(term)
      );
    }
    filtered = filtered.filter(product => {
      const price = product.discountPrice || product.price || 0;
      return price >= this.priceRange.min && price <= this.priceRange.max;
    });
    filtered = this.sortProducts(filtered);
    return filtered;
  }
  sortProducts(products: ProductResultDto[]): ProductResultDto[] {
    return [...products].sort((a, b) => {
      switch (this.sortBy) {
        case 'price-low':
          return (a.discountPrice || a.price || 0) - (b.discountPrice || b.price || 0);
        case 'price-high':
          return (b.discountPrice || b.price || 0) - (a.discountPrice || a.price || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'discount':
          const discountA = this.calculateDiscountPercentage(a);
          const discountB = this.calculateDiscountPercentage(b);
          return discountB - discountA;
        default: 
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });
  }
  calculateDiscountPercentage(product: ProductResultDto): number {
    if (!product.discountPrice || product.discountPrice >= product.price) return 0;
    return Math.round(((product.price - product.discountPrice) / product.price) * 100);
  }
  updateQueryParams(): void {
    const queryParams: any = {};
    if (this.currentPage > 1) queryParams['page'] = this.currentPage;
    if (this.selectedCategory !== 'all') queryParams['category'] = this.selectedCategory;
    if (this.searchTerm.trim()) queryParams['search'] = this.searchTerm;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }
  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }
  onCategoryChange(): void {
    this.currentPage = 1;
    this.updateQueryParams();
  }
  onSortChange(): void {
    this.filteredProducts = this.sortProducts(this.filteredProducts);
  }
  onPriceRangeChange(): void {
    this.currentPage = 1;
    this.filteredProducts = this.applyFilters(this.products);
  }
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    
    this.currentPage = page;
    this.updateQueryParams();
    this.scrollToTop();
  }
  loadMore(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducts();
    }
  }
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  getDisplayPrice(product: ProductResultDto): string {
    if (product.discountPrice && product.discountPrice < product.price) {
      return `$${product.discountPrice.toFixed(2)}`;
    }
    return `$${product.price.toFixed(2)}`;
  }
  getOriginalPrice(product: ProductResultDto): string {
    if (product.discountPrice && product.discountPrice < product.price) {
      return `$${product.price.toFixed(2)}`;
    }
    return '';
  }
  getProductImage(product: ProductResultDto): string {
    return product.pictureUrl || 'assets/Images/default-product.jpg';
  }
  getStockPercentage(product: ProductResultDto): number {
    const quantity = product.quantity || 0;
    
    if (quantity === 0) return 0;
    if (quantity <= 5) return 20;
    if (quantity <= 10) return 40;
    if (quantity <= 20) return 60;
    if (quantity <= 50) return 80;
    return 100;
  }
  getStockColor(product: ProductResultDto): string {
    const quantity = product.quantity || 0;
    
    if (quantity === 0) return 'text-red-600 bg-red-50';
    if (quantity <= 5) return 'text-yellow-600 bg-yellow-50';
    if (quantity <= 10) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  }
  getStockText(product: ProductResultDto): string {
    const quantity = product.quantity || 0;
    
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 5) return 'Very Low Stock';
    if (quantity <= 10) return 'Low Stock';
    if (quantity <= 20) return 'In Stock';
    return 'High Stock';
  }
  getPageNumbers(): number[] {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }
  getStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }
  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.sortBy = 'newest';
    this.priceRange = { min: 0, max: 10000 };
    this.currentPage = 1;
    this.updateQueryParams();
  }
  getCategoryImage(categoryName: string): string {
    const categoryImageMap: {[key: string]: string} = {
      'Supplies': 'Category-1.jpg',
      'Technology': 'category-2.jpeg',
      'Medical': 'category-3.jpg',
      'Engineering': 'category-4.png',
      'Workspaces': 'Category-11.avif',
      'Uniform': 'Category-1.jpg'  
    };
    
    const fileName = categoryImageMap[categoryName];
    return fileName ? `assets/Images/categories/${fileName}` : 'assets/Images/default-category.jpg';
  }
  onImageError(event: Event): void {
  const imgElement = event.target as HTMLImageElement;
  imgElement.src = 'assets/Images/default-category.jpg';
}
onProductImageError(event: Event): void {
  const imgElement = event.target as HTMLImageElement;
  imgElement.src = 'assets/Images/default-product.jpg';
}
}