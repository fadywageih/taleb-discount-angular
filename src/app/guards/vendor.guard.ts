import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../Services/account/account-service';

export const vendorGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  const currentUser = accountService.getCurrentUser();
  
  if (currentUser && currentUser.userType === 'Vendor') {
    return true;
  } else {
    if (currentUser) {
      switch (currentUser.userType) {
        case 'School':
          router.navigate(['/home']);
          break;
        case 'University':
          router.navigate(['/home']);
          break;
        default:
          router.navigate(['/login']);
      }
    } else {
      router.navigate(['/login']);
    }
    return false;
  }
};