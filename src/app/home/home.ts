import { Component, OnInit, inject, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../Services/account/account-service';
import { HomePageData } from '../core/types/User/HomePageData';
import { ProductResultDto } from '../core';
import { Header } from '../shared/header/header';
import { HomeService } from '../Services/home/home-service';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    Header
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit, OnDestroy {
  private homeService = inject(HomeService);
  private accountService = inject(AccountService);
  private router = inject(Router);
  
  homeData: HomePageData = {
    featuredProducts: [],
    categories: [],
    featuredVendors: [],
    advertisements: []  
  };
  
  randomProducts: ProductResultDto[] = [];
  bestProducts: ProductResultDto[] = [];
  
  loading = true;
  error = '';
  
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    this.loadHomePageData();
  }

  ngOnDestroy(): void {
    // تنظيف
  }

  loadHomePageData(): void {
    this.loading = true;
    this.error = '';

    setTimeout(() => {
      const user = this.accountService.getCurrentUser();
      const homeData$ = user?.userType === 'School' || user?.userType === 'University'
        ? this.homeService.getStudentHomePageData()
        : this.homeService.getHomePageData();

      homeData$.subscribe({
        next: (data) => {
          console.log('✅ Home data loaded:', data);
          this.homeData = data;
          this.randomProducts = data.featuredProducts.slice(0, 7);
          this.bestProducts = this.getBestProducts(data.featuredProducts, 3);
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Error loading home data:', err);
          this.error = 'Failed to load home page data';
          this.loading = false;
        }
      });
    }, 100);
  }
  scrollLeft(): void {
    if (this.scrollContainer?.nativeElement) {
      const container = this.scrollContainer.nativeElement;
      const scrollAmount = 400;
      
      container.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    }
  }
  scrollRight(): void {
    if (this.scrollContainer?.nativeElement) {
      const container = this.scrollContainer.nativeElement;
      const scrollAmount = 400;
      
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }
  getBestProducts(products: ProductResultDto[], count: number): ProductResultDto[] {
    return [...products]
      .filter(p => p.discountPrice)
      .sort((a, b) => {
        const discountA = this.calculateDiscountPercentage(a);
        const discountB = this.calculateDiscountPercentage(b);
        return discountB - discountA;
      })
      .slice(0, count);
  }

  onCategorySelect(categoryId: number): void {
    this.router.navigate(['/products'], { queryParams: { category: categoryId } });
  }

  calculateDiscountPercentage(product: ProductResultDto): number {
    if (!product.discountPrice || product.discountPrice >= product.price) return 0;
    return Math.round(((product.price - product.discountPrice) / product.price) * 100);
  }

  // إضافة دالة لعرض السعر مع الخصم
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

getStockPercentage(product: ProductResultDto): number {
  const quantity = product.quantity || 0;
  
  if (quantity === 0) return 0;
  if (quantity <= 5) return 20;
  if (quantity <= 10) return 40;
  if (quantity <= 20) return 60;
  if (quantity <= 50) return 80;
  return 100;
}

  getProductImage(product: ProductResultDto): string {
    return product.pictureUrl || 'assets/Images/default-product.jpg';
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
    
    if (fileName) {
      return `assets/Images/categories/${fileName}`;
    }
    
    return 'assets/Images/default-category.jpg';
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/Images/default-category.jpg';
  }

  get userType(): string {
    return this.accountService.getCurrentUser()?.userType || '';
  }

  get isStudent(): boolean {
    const userType = this.userType;
    return userType === 'School' || userType === 'University';
  }

  goToAllProducts(): void {
    this.router.navigate(['/products']);
  }

  get splitLetters(): any[] {
    const text = "One Click, Countless Student Savings!";
    const letters = [];
    
    for(let i = 0; i < text.length; i++) {
      const popDelay = (i * 0.1) + 's';
      const gradientDelay = '0.1s';
      
      letters.push({
        char: text[i],
        delays: `${popDelay}, ${gradientDelay}`,
        isSpace: text[i] === ' '
      });
    }
    
    return letters;
  }
}