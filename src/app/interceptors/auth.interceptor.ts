import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AccountService } from '../Services/account/account-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const accountService = inject(AccountService);
  const token = accountService.getToken();

  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  return next(req);
};