import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  private apiUrl = 'https://localhost:7233/api/Authentication';

  constructor(private http: HttpClient) { }

  checkEmailExists(email: string): Observable<boolean> {
    console.log('🔍 ValidationService: Checking email:', email);
    
    // استخدام HttpParams للـ query parameters الآمنة
    const params = new HttpParams().set('email', email);
    
    return this.http.get<boolean>(`${this.apiUrl}/emailexists`, { params })
      .pipe(
        tap(result => console.log('✅ ValidationService: Email check result:', result)),
        catchError(error => {
          console.error('❌ ValidationService: Email check error:', error);
          // إرجاع false في حالة الخطأ (افتراض أن الإيميل غير مستخدم)
          return [false];
        })
      );
  }
}