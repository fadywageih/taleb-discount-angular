import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  private apiUrl = 'https://localhost:7233/api/Authentication';  // تعديل حسب الـ API الخاص بك


  constructor(private http: HttpClient) { }

  checkEmailExists(email: string): Observable<boolean> {
    console.log('Checking email:', email);
    return this.http.get<boolean>(`${this.apiUrl}/emailexists?email=${encodeURIComponent(email)}`)
      .pipe(
        tap(result => console.log('Email check result:', result))
      );
  }
}