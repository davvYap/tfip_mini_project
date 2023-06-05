import { inject } from '@angular/core';
import { CanActivateFn, CanDeactivateFn, Router } from '@angular/router';
import { GetService } from './get.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const getSvc = inject(GetService);
  const router = inject(Router);

  if (getSvc.isLogin) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
