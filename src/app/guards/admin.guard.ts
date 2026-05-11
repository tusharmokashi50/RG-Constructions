import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';

export const adminGuard: CanActivateFn = (route, state) => {

  const auth = inject(Auth);
  const router = inject(Router);

  const user = auth.currentUser;

  // Check if user is logged in and is admin
  if (user && user.email === 'admin@rgconstruction.com') {
    return true;
  }

  // Redirect to admin login
  router.navigate(['/admin-login']);
  return false;

};
