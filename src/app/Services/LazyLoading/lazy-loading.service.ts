// services/lazy-loading.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, tap, shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LazyLoadingService {
  private http = inject(HttpClient);
  private cache = new Map<string, any>();
  private loadingStates = new Map<string, BehaviorSubject<boolean>>();
  private imageCache = new Set<string>();
  preloadCriticalImages(): void {
    const criticalImages = [
      'assets/Images/photo1.jpg',
      'assets/Images/backpack.png',
      'assets/Images/default-product.jpg',
      'assets/Images/default-category.jpg'
    ];
    criticalImages.forEach(imageUrl => {
      this.preloadImage(imageUrl);
    });
  }
  preloadImage(url: string): void {
    if (this.imageCache.has(url)) return;
    
    const img = new Image();
    img.src = url;
    this.imageCache.add(url);
  }
  getWithCache<T>(key: string, fetchFn: () => Observable<T>, ttl: number = 300000): Observable<T> {
    const cached = this.cache.get(key);
    const now = Date.now();
    if (cached && (now - cached.timestamp < ttl)) {
      return of(cached.data);
    }
    this.setLoadingState(key, true);
    return fetchFn().pipe(
      tap(data => {
        this.cache.set(key, {
          data,
          timestamp: now
        });
        this.setLoadingState(key, false);
      }),
      catchError(error => {
        this.setLoadingState(key, false);
        throw error;
      }),
      shareReplay(1)
    );
  }
  private setLoadingState(key: string, isLoading: boolean): void {
    if (!this.loadingStates.has(key)) {
      this.loadingStates.set(key, new BehaviorSubject<boolean>(false));
    }
    this.loadingStates.get(key)!.next(isLoading);
  }
  getLoadingState(key: string): Observable<boolean> {
    if (!this.loadingStates.has(key)) {
      this.loadingStates.set(key, new BehaviorSubject<boolean>(false));
    }
    return this.loadingStates.get(key)!.asObservable();
  }
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}