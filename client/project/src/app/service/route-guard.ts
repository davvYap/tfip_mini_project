import { inject } from '@angular/core';
import { CanActivateFn, CanDeactivateFn, Router } from '@angular/router';
import { GetService } from './get.service';
import { RoutePersistenceService } from './route-persistence.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const getSvc = inject(GetService);
  const router = inject(Router);
  const routePerSvc = inject(RoutePersistenceService);

  let isLogin!: boolean;
  getSvc.checkLoginStatus().then((res) => {
    isLogin = res.isLogin;
    getSvc.isLogin = res.isLogin;
  });

  if (getSvc.isLogin) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
