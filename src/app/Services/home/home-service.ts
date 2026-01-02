    import { Injectable, inject } from '@angular/core';
    import { HttpClient, HttpParams } from '@angular/common/http';
    import { Observable, of } from 'rxjs';
    import { environment } from '../../../environments/environment';
    import { AccountService } from '../account/account-service';
    import { HomePageData } from '../../core/types/User/HomePageData';

    @Injectable({
      providedIn: 'root'
    })
    export class HomeService {
      private apiUrl = `${environment.apiUrl}home`;
      private http = inject(HttpClient);
      private accountService = inject(AccountService);
      constructor() {
        console.log('🔗 Home Service API URL:', this.apiUrl);
      }
      getHomePageData(): Observable<HomePageData> {
        console.log('🔄 Fetching home page data...');
        return this.http.get<HomePageData>(this.apiUrl);
      }
      getStudentHomePageData(): Observable<HomePageData> {
        console.log('🎓 Fetching student home page data...');
        return this.http.get<HomePageData>(`${this.apiUrl}/student`);
      }
      getAllProductsForStudents(params?: any): Observable<any> {
        console.log('🎓 Fetching all products for students...');
        
        let httpParams = new HttpParams();
        if (params) {
          Object.keys(params).forEach(key => {
            const value = (params as any)[key];
            if (value !== undefined && value !== null && value !== '') {
              httpParams = httpParams.set(key, value.toString());
            }
          });
        }

        return this.http.get<any>(`${environment.apiUrl}products`, { 
          params: httpParams
        });
      }

      searchProducts(searchTerm: string, categoryId?: number): Observable<any> {
        console.log('🔍 Searching products:', searchTerm);
        
        let params = new HttpParams().set('searchTerm', searchTerm);
        if (categoryId) {
          params = params.set('categoryId', categoryId.toString());
        }

        return this.http.get<any>(`${environment.apiUrl}products/search`, { params });
      }
      getQuickHomePageData(): Observable<HomePageData> {
  console.log('⚡ Fetching quick home page data...');
  return this.http.get<HomePageData>(`${this.apiUrl}/quick`);
}
    }