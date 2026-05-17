import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is logged in and is admin
  if (authService.isAdmin()) {
    return true;
  }

  // Redirect to admin login
  router.navigate(['/admin-login']);
  return false;
};
