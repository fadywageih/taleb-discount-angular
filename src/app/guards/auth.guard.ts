import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../Services/account/account-service';

export const authGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  if (accountService.isLoggedIn()) {
    const user = accountService.getCurrentUser();
    if (user?.userType === 'School' || user?.userType === 'University' || user?.userType === 'Vendor') {
      return true;
    }
  }
  
  router.navigate(['/login']);
  return false;
};