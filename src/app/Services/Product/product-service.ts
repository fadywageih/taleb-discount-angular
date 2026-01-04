import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
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
import { ExtendedProductParameters } from '../../core/types/Product/product-parameters';
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
  private getAuthHeaders(): HttpHeaders {
    const token = this.accountService.getToken();
    console.log('🔐 Product Service Token:', token ? 'Exists' : 'Missing');
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
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
    return of([]);
  }

  getAllBrands(): Observable<BrandResultDto[]> {
    console.log('🔄 Fetching brands...');
    return of([]);
  }
  getVendorProducts(): Observable<ProductResultDto[]> {
    console.log('🔄 Fetching vendor products...');
    return this.http.get<ProductResultDto[]>(`${this.baseUrl}/vendor`, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }
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
getAllProducts(params?: ExtendedProductParameters): Observable<PaginatedResult<ProductResultDto>> {
  console.log('🔄 Fetching all products with params:', params);
  let httpParams = new HttpParams();
  if (params) {
    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });
  }
  return this.http.get<PaginatedResult<ProductResultDto>>(this.baseUrl, { 
    headers: this.getAuthHeaders(),
    params: httpParams
  }).pipe(
    catchError(this.handleError.bind(this))
  );
}
getAllProductsForStudents(params?: ExtendedProductParameters): Observable<PaginatedResult<ProductResultDto>> {
  console.log('🎓 Fetching all products for students...');
  return this.getAllProducts(params);
}
  getBestSellingProducts(): Observable<ProductResultDto[]> {
    console.log('🔄 Fetching best selling products...');
    return this.http.get<ProductResultDto[]>(`${this.baseUrl}/best-selling`, { 
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }
  getProductsByCategory(categoryId: number): Observable<ProductResultDto[]> {
    console.log('🔄 Fetching products by category:', categoryId);
    return this.http.get<ProductResultDto[]>(`${this.baseUrl}/category/${categoryId}`, { 
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }
  searchProducts(searchTerm: string): Observable<ProductResultDto[]> {
    console.log('🔍 Searching products:', searchTerm);
    const params = new HttpParams().set('searchTerm', searchTerm);
    return this.http.get<ProductResultDto[]>(`${this.baseUrl}/search`, { 
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

}

