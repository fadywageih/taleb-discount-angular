import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
export const appConfig: ApplicationConfig = {
  providers: [
    // الأساسيات أولاً
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // HTTP Client مع الـ interceptor
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withFetch() // اختياري - إذا كنت تستخدم Fetch API
    ),
    
    // Router
    provideRouter(routes),
    
    // Animations (إذا محتاج)
  ]
};
