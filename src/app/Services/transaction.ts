import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators'; 
import { AccountService } from './account/account-service';
import { 
  TransactionDto, 
} from '../core/types/Transaction/TransactionDto';
import { TransactionCreateDto } from '../core/types/Transaction/TransactionCreateDto';
import { TransactionStatsDto } from '../core/types/Transaction/TransactionStatsDto';
import { TransactionUpdateStatusDto } from '../core/types/Transaction/TransactionUpdateStatusDto';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = 'https://localhost:7233/api/transactions';
  private http = inject(HttpClient);
  private accountService = inject(AccountService);
  private getHeaders(): HttpHeaders {
    const token = this.accountService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  createTransaction(dto: TransactionCreateDto): Observable<TransactionDto> {
    console.log('📤 Creating transaction at:', this.apiUrl);
    console.log('📦 Request payload:', dto);
    
    return this.http.post<TransactionDto>(this.apiUrl, dto, {
      headers: this.getHeaders()
    }).pipe(
      tap((response: TransactionDto) => console.log('✅ Transaction created:', response)),
      catchError((error: any) => {
        console.error('❌ Transaction error:', error);
        return throwError(() => error);
      })
    );
  }
  getTransactionById(id: string): Observable<TransactionDto> {
    return this.http.get<TransactionDto>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
  getVendorTransactions(): Observable<TransactionDto[]> {
    return this.http.get<TransactionDto[]>(`${this.apiUrl}/vendor`, {
      headers: this.getHeaders()
    });
  }
  getVendorStats(): Observable<TransactionStatsDto> {
    return this.http.get<TransactionStatsDto>(`${this.apiUrl}/vendor/stats`, {
      headers: this.getHeaders()
    });
  }
acceptTransaction(transactionId: string): Observable<TransactionDto> {
    const dto: TransactionUpdateStatusDto = { 
        TransactionId: transactionId
    };
    
    return this.http.post<TransactionDto>(`${this.apiUrl}/accept`, dto, {
        headers: this.getHeaders()
    }).pipe(
        catchError((error: HttpErrorResponse) => {
            let userMessage = 'Failed to accept transaction. Please try again.';
            
            if (error.error?.error) {
                const serverError = error.error.error;
                
                if (serverError.includes('Vendor profile not found')) {
                    userMessage = 'Vendor profile not found. Please complete your vendor profile setup.';
                } else if (serverError.includes('cannot accept this transaction')) {
                    userMessage = serverError;
                } else if (serverError.includes('Transaction cannot be accepted')) {
                    userMessage = serverError;
                } else if (serverError.includes('Transaction not found')) {
                    userMessage = 'Transaction not found. It may have been deleted or already processed.';
                }
            } else if (error.status === 401) {
                userMessage = 'Session expired. Please login again.';
            } else if (error.status === 404) {
                userMessage = 'Transaction not found.';
            }
            
            return throwError(() => new Error(userMessage));
        })
    );
}
rejectTransaction(transactionId: string, reason: string): Observable<TransactionDto> {
    try {
        console.group('🔄 Reject Transaction Debug');
        console.log('📋 Transaction ID:', transactionId);
        console.log('📝 Rejection Reason:', reason);
        console.log('🔗 Endpoint URL:', `${this.apiUrl}/reject`);
        
        const dto: TransactionUpdateStatusDto = { 
            TransactionId: transactionId,
            RejectionReason: reason
        };
        
        console.log('📦 Request DTO:', dto);
        
        // تحقق من Authentication
        const token = this.accountService.getToken();
        if (token) {
            try {
                const tokenParts = token.split('.');
                if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]));
                    console.log('👤 Current User:', {
                        userId: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
                        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
                        role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
                    });
                }
            } catch (e) {
                console.warn('Could not decode token:', e);
            }
        }
        console.groupEnd();
        
        return this.http.post<TransactionDto>(`${this.apiUrl}/reject`, dto, {
            headers: this.getHeaders()
        }).pipe(
            tap((response: TransactionDto) => {
                console.group('✅ Transaction Rejected Successfully');
                console.log('🆔 Transaction:', response.transactionNumber);
                console.log('📊 New Status:', response.status);
                console.log('📝 Rejection Reason:', response.rejectionReason);
                console.groupEnd();
            }),
            catchError((error: HttpErrorResponse) => {
                console.group('❌ Transaction Rejection Failed');
                console.error('📡 HTTP Error:', {
                    status: error.status,
                    error: error.error,
                    url: error.url
                });
                
                // تحليل رسالة الخطأ
                if (error.error?.error) {
                    const serverError = error.error.error;
                    console.error('🔍 Server Message:', serverError);
                    
                    if (serverError.includes('cannot reject this transaction')) {
                        console.error('💡 Solution: Login with correct vendor account');
                    } else if (serverError.includes('Transaction cannot be rejected')) {
                        console.error('💡 Reason: Transaction is not in Pending status');
                    }
                }
                console.groupEnd();
                
                return throwError(() => error);
            })
        );
    } catch (error: any) {
        console.error('🚨 Pre-flight validation error:', error);
        return throwError(() => new Error(error.message || 'Invalid transaction data'));
    }
}
  completeTransaction(transactionId: string): Observable<TransactionDto> {
    const dto: TransactionUpdateStatusDto = { TransactionId: transactionId };
    return this.http.post<TransactionDto>(`${this.apiUrl}/complete`, dto, {
      headers: this.getHeaders()
    });
  }
getCustomerTransactions(): Observable<TransactionDto[]> {
    console.log('🔍 DEBUG: Calling getCustomerTransactions');
    return this.http.get<TransactionDto[]>(`${this.apiUrl}/customer`, {
        headers: this.getHeaders()
    }).pipe(
        tap((transactions: TransactionDto[]) => {
            console.log('✅ DEBUG: Transactions received:', transactions.length);
            if (transactions.length > 0) {
                const first = transactions[0];
                console.log('📦 DEBUG First Transaction:', {
                    id: first.id,
                    productName: first.productName,
                    productPictureUrl: first.productPictureUrl,
                    type: typeof first.productPictureUrl,
                    startsWithHttp: first.productPictureUrl?.startsWith('http'),
                    startsWithSlash: first.productPictureUrl?.startsWith('/'),
                    length: first.productPictureUrl?.length
                });
            }
        }),
        catchError((error) => {
            console.error('❌ DEBUG: Error loading transactions:', error);
            return throwError(() => error);
        })
    );
}

  cancelTransaction(transactionId: string): Observable<TransactionDto> {
    const dto: TransactionUpdateStatusDto = { TransactionId: transactionId };
    return this.http.post<TransactionDto>(`${this.apiUrl}/cancel`, dto, {
      headers: this.getHeaders()
    });
  }
  getProductImageUrl(pictureUrl: string | null | undefined): string {
    console.log('🖼️ Formatting image URL:', pictureUrl);
    
    if (!pictureUrl) {
        console.log('⚠️ No image URL provided, using default');
        return 'assets/Images/default-product.jpg';
    }
    if (pictureUrl.startsWith('http://') || pictureUrl.startsWith('https://')) {
        console.log('✅ Already full URL');
        return pictureUrl;
    }
    if (pictureUrl.startsWith('/')) {
        const fullUrl = 'https://localhost:7233' + pictureUrl;
        console.log('🔄 Added base URL:', fullUrl);
        return fullUrl;
    }
    const fullUrl = 'https://localhost:7233/uploads/' + pictureUrl;
    console.log('📁 Assumed uploads folder:', fullUrl);
    return fullUrl;
}
}