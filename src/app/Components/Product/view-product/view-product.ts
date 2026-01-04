import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { ProductResultDto } from '../../../core';
import { HomeService } from '../../../Services/home/home-service';
import { AccountService } from '../../../Services/account/account-service';
import { Header } from '../../../shared/header/header';
import { ProductService } from '../../../Services/Product/product-service';
import { ExtendedProductParameters, ProductSortOption } from '../../../core/types/Product/product-parameters';

@Component({
  selector: 'app-view-product',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Header],
  templateUrl: './view-product.html',
  styleUrls: ['./view-product.css']
})
export class ViewProduct implements OnInit, OnDestroy {
  private homeService = inject(HomeService);
  private productService = inject(ProductService);
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

  splitLetters: any[] = [];

  ngOnInit(): void {
    this.initSplitLetters();
    this.loadCategories();
    this.setupSearch();
    this.listenToQueryParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initSplitLetters(): void {
    const text = "One Click, Countless Student Savings!";
    this.splitLetters = [];
    
    for(let i = 0; i < text.length; i++) {
      const popDelay = (i * 0.1) + 's';
      const gradientDelay = '0.1s';
      
      this.splitLetters.push({
        char: text[i],
        delays: `${popDelay}, ${gradientDelay}`,
        isSpace: text[i] === ' '
      });
    }
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
    const params: ExtendedProductParameters = {
      PageIndex: this.currentPage,
      PageSize: this.itemsPerPage,
      Search: this.searchTerm || undefined,
      Sort: this.mapSortOption(this.sortBy),
      MinPrice: this.priceRange.min > 0 ? this.priceRange.min : undefined,
      MaxPrice: this.priceRange.max < 10000 ? this.priceRange.max : undefined
    };
    if (this.selectedCategory !== 'all') {
      params.CategoryId = parseInt(this.selectedCategory);
    }
    console.log('📤 Sending params to backend:', params);
    const productService$ = this.productService.getAllProducts(params);
    productService$.subscribe({
      next: (response) => {
        console.log('📥 Received response:', response);
        
        if (response) {
          this.products = response.data || [];
          this.totalItems = response.totalCount || 0;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          
          // تصحيح الصفحة الحالية إذا لزم الأمر
          if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = this.totalPages;
            this.loadProducts();
            return;
          }
          this.filteredProducts = [...this.products];
        } else {
          this.products = [];
          this.filteredProducts = [];
          this.totalItems = 0;
          this.totalPages = 1;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error loading products:', err);
        this.error = 'Failed to load products. Please try again.';
        this.loading = false;
      }
    });
  }
private mapSortOption(sortBy: string): ProductSortOption | undefined {
  switch (sortBy) {
    case 'name':
      return ProductSortOption.NameAsc;
    case 'newest':
      return ProductSortOption.Newest;
    case 'price-low':
      return ProductSortOption.PriceAsc;
    case 'price-high':
      return ProductSortOption.PriceDesc;
    case 'discount':
      return ProductSortOption.DiscountDesc;
    default:
      return ProductSortOption.Newest;
  }
}
  applyFilters(products: ProductResultDto[]): ProductResultDto[] {
    return [...products];
  }
  sortProducts(products: ProductResultDto[]): ProductResultDto[] {
    return [...products];
  }
  calculateDiscountPercentage(product: ProductResultDto): number {
    if (!product.price || product.price === 0) return 0;
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
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
  onSearch(): void {
    this.searchSubject.next(this.searchTerm);
  }
  onCategoryChange(): void {
    this.currentPage = 1;
    this.loadProducts(); 
    this.updateQueryParams();
  }
  onSortChange(): void {
    this.currentPage = 1;
    this.loadProducts(); 
  }

  onPriceRangeChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    
    this.currentPage = page;
    this.loadProducts(); 
    this.updateQueryParams();
    this.scrollToTop();
  }

  loadMore(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      const params: ExtendedProductParameters = {
        PageIndex: this.currentPage,
        PageSize: this.itemsPerPage,
        Search: this.searchTerm || undefined,
        Sort: this.mapSortOption(this.sortBy),
        MinPrice: this.priceRange.min > 0 ? this.priceRange.min : undefined,
        MaxPrice: this.priceRange.max < 10000 ? this.priceRange.max : undefined
      };

      if (this.selectedCategory !== 'all') {
        params.CategoryId = parseInt(this.selectedCategory);
      }

      this.loading = true;
      this.productService.getAllProducts(params).subscribe({
        next: (response) => {
          if (response?.data) {
            this.products = [...this.products, ...response.data];
            this.filteredProducts = [...this.products];
            this.totalItems = response.totalCount || 0;
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Error loading more products:', err);
          this.loading = false;
        }
      });
    }
  }
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getDisplayPrice(product: ProductResultDto): string {
    const price = product.discountPrice || product.price || 0;
    return `$${price.toFixed(2)}`;
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
    
    if (quantity === 0) return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
    if (quantity <= 5) return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
    if (quantity <= 10) return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
    return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
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
    this.loadProducts();
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
  onAddToCart(product: ProductResultDto): void {
    if (product.quantity === 0) return;
    
    console.log('Add to cart:', product);
    alert(`Added ${product.name} to cart!`);
  }

  onQuickView(product: ProductResultDto): void {
    console.log('Quick view:', product);
  }

  onWishlist(product: ProductResultDto): void {
    console.log('Add to wishlist:', product);
  }
}