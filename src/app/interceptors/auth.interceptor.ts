import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AccountService } from '../Services/account/account-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const accountService = inject(AccountService);
  const token = accountService.getToken();

  console.log('🔐 Auth Interceptor:', {
    url: req.url,
    hasToken: !!token,
    token: token ? '***' + token.slice(-10) : 'None'
  });

  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('✅ Adding Authorization header');
    return next(authReq);
  }

  console.log('⚠️ No token found, proceeding without Authorization header');
  return next(req);
};