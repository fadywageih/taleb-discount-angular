// src/app/Services/Product/product-service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AccountService } from '../account/account-service';
import { 
  ProductCreateDto, 
  ProductUpdateDto, 
  ProductResultDto, 
  CategoryResultDto, 
  BrandResultDto,
  PaginatedResult 
} from '../../core';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = `${environment.apiUrl}products`;
  private http = inject(HttpClient);
  private accountService = inject(AccountService);

  constructor() {
    console.log('🔗 Product Service API URL:', this.baseUrl);
  }

  // إنشاء headers مع الـ token
  private getAuthHeaders(): HttpHeaders {
    const token = this.accountService.getToken();
    console.log('🔐 Product Service Token:', token ? 'Exists' : 'Missing');
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // لا تضيف Content-Type هنا علشان FormData يضيفها تلقائياً
    });
  }

  createProduct(productData: FormData): Observable<ProductResultDto> {
    console.log('🔄 Creating product...');
    return this.http.post<ProductResultDto>(this.baseUrl, productData, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

updateProduct(id: number, productData: FormData): Observable<void> {
  console.log('🔄 Updating product:', id);
  return this.http.put<void>(`${this.baseUrl}/${id}`, productData, { 
    headers: this.getAuthHeaders() 
  }).pipe(
    catchError(this.handleError.bind(this))
  );
}

  deleteProduct(id: number): Observable<void> {
    console.log('🔄 Deleting product:', id);
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getProductById(id: number): Observable<ProductResultDto> {
    console.log('🔄 Fetching product:', id);
    return this.http.get<ProductResultDto>(`${this.baseUrl}/${id}`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getAllCategories(): Observable<CategoryResultDto[]> {
    console.log('🔄 Fetching categories...');
    return this.http.get<CategoryResultDto[]>(`${environment.apiUrl}categories`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getAllBrands(): Observable<BrandResultDto[]> {
    console.log('🔄 Fetching brands...');
    return this.http.get<BrandResultDto[]>(`${environment.apiUrl}brands`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getVendorProducts(): Observable<ProductResultDto[]> {
    console.log('🔄 Fetching vendor products...');
    return this.http.get<ProductResultDto[]>(`${this.baseUrl}/vendor`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // دالة للحصول على المنتجات مع pagination إذا محتاج
  getProductsPaginated(params?: any): Observable<PaginatedResult<ProductResultDto>> {
    console.log('🔄 Fetching paginated products...');
    return this.http.get<PaginatedResult<ProductResultDto>>(this.baseUrl, { 
      headers: this.getAuthHeaders(),
      params 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ Product Service Error Details:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: error.message,
      error: error.error
    });
    
    let errorMessage = 'An unexpected error occurred';
    
    if (error.status === 0) {
      errorMessage = 'Network error: Cannot connect to server';
    } else if (error.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (error.status === 403) {
      errorMessage = 'Access denied. Vendor access required.';
    } else if (error.status === 404) {
      errorMessage = 'Resource not found';
    } else if (error.status === 500) {
      errorMessage = 'Internal server error';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}

