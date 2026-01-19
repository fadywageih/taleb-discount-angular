import { Injectable, inject, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { 
  LoginDto, 
  UserResultDto, 
  ResetPasswordDto,
  SchoolRegisterDto,
  VendorRegisterDto,
  UniversityRegisterDto ,

} from '../../core/index'; 

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private baseUrl = 'https://localhost:7233/api/Authentication';
  private currentUserSource = new BehaviorSubject<UserResultDto | null>(null);
  public currentUser$ = this.currentUserSource.asObservable();
  private http = inject(HttpClient);
  private router = inject(Router);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadCurrentUser();
    }
  }

  private loadCurrentUser(): void {
    const user = this.getCurrentUser();
    if (user) {
      this.currentUserSource.next(user);
    }
  }

  login(loginDto: LoginDto): Observable<UserResultDto> {
    return this.http.post<UserResultDto>(`${this.baseUrl}/Login`, loginDto).pipe(
      tap(user => {
        if (user && user.token) {
          this.setLocalStorage('token', user.token);
          this.setLocalStorage('user', JSON.stringify(user));
          this.currentUserSource.next(user);
        }
      })
    );
  }

  logout() {
    this.removeLocalStorage('token');
    this.removeLocalStorage('user');
    this.currentUserSource.next(null);

    if (isPlatformBrowser(this.platformId)) {
      this.router.navigate(['/login']);
    }
  }

  getCurrentUser(): UserResultDto | null {
    try {
      if (!isPlatformBrowser(this.platformId)) {
        return null; 
      }
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  isVendor(): boolean {
    const user = this.getCurrentUser();
    return user?.userType === 'Vendor';
  }

  isSchool(): boolean {
    const user = this.getCurrentUser();
    return user?.userType === 'School';
  }

  isUniversity(): boolean {
    const user = this.getCurrentUser();
    return user?.userType === 'University';
  }

  getUserType(): string | null {
    const user = this.getCurrentUser();
    return user?.userType || null;
  }
  private setLocalStorage(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, value);
    }
  }

  private removeLocalStorage(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);
    }
  }

  registerSchool(registerData: SchoolRegisterDto): Observable<UserResultDto> {
    const formData = new FormData();
    Object.keys(registerData).forEach(key => {
      if (key === 'birthCertificateFile') {
        formData.append(key, registerData[key]);
      } else {
        formData.append(key, (registerData as any)[key]);
      }
    });

    return this.http.post<UserResultDto>(`${this.baseUrl}/register/school`, formData).pipe(
      tap(user => {
        if (user && user.token) {
          // تأكد أن الـ userType مضبوط بشكل صحيح
          const userWithType = { ...user, userType: 'School' };
          this.setLocalStorage('token', userWithType.token);
          this.setLocalStorage('user', JSON.stringify(userWithType));
          this.currentUserSource.next(userWithType);
        }
      })
    );
  }

  registerVendor(registerData: VendorRegisterDto): Observable<UserResultDto> {
    return this.http.post<UserResultDto>(`${this.baseUrl}/register/vendor`, registerData).pipe(
      tap(user => {
        if (user && user.token) {
          // تأكد أن الـ userType مضبوط بشكل صحيح
          const userWithType = { ...user, userType: 'Vendor' };
          this.setLocalStorage('token', userWithType.token);
          this.setLocalStorage('user', JSON.stringify(userWithType));
          this.currentUserSource.next(userWithType);
        }
      })
    );
  }

  registerUniversity(registerData: UniversityRegisterDto): Observable<UserResultDto> {
    const formData = new FormData();
    Object.keys(registerData).forEach(key => {
      if (key === 'nationalIdFile') {
        formData.append(key, registerData[key]);
      } else {
        formData.append(key, (registerData as any)[key]);
      }
    });

    return this.http.post<UserResultDto>(`${this.baseUrl}/register/university`, formData).pipe(
      tap(user => {
        if (user && user.token) {
          // تأكد أن الـ userType مضبوط بشكل صحيح
          const userWithType = { ...user, userType: 'University' };
          this.setLocalStorage('token', userWithType.token);
          this.setLocalStorage('user', JSON.stringify(userWithType));
          this.currentUserSource.next(userWithType);
        }
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email });
  }

  resetPassword(resetData: ResetPasswordDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, resetData);
  }
}