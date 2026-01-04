// vendor.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AccountService } from '../account/account-service';
import { UpdateVendorDto, VendorDto } from '../../core';

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private apiUrl = `${environment.apiUrl}Vendor`;
  constructor(
    private http: HttpClient,
    private accountService: AccountService
  ) {
    console.log('🔗 API URL:', this.apiUrl);
  }
  private getAuthHeaders(): HttpHeaders {
    const token = this.accountService.getToken();
    console.log('🔐 Token for request:', token ? 'Exists' : 'Missing');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  getVendorProfile(): Observable<VendorDto> {
    const url = `${this.apiUrl}/profile`;
    console.log('🔄 Fetching vendor profile from:', url);
    return this.http.get<VendorDto>(url, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError.bind(this))
    );
  }
  updateVendorProfile(vendorData: UpdateVendorDto): Observable<VendorDto> {
    const url = `${this.apiUrl}/profile`;
    console.log('🔄 Updating vendor profile at:', url);
    return this.http.put<VendorDto>(url, vendorData, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError.bind(this))
    );
  }
  private handleError(error: HttpErrorResponse) {
    console.error('❌ API Error Details:', {
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
    } else if (error.status === 404) {
      errorMessage = 'Vendor profile not found. Please complete your profile setup.';
    } else if (error.status === 500) {
      errorMessage = 'Internal server error';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
}