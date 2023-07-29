import { inject } from '@angular/core';
import { CanActivateFn, CanDeactivateFn, Router } from '@angular/router';
import { GetService } from './get.service';
import { RoutePersistenceService } from './route-persistence.service';
import { ThemeService } from './theme.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const getSvc = inject(GetService);
  const router = inject(Router);
  const routePerSvc = inject(RoutePersistenceService);
  const themeSvc = inject(ThemeService);

  let isLogin!: boolean;

  if (localStorage.getItem('isLogin') === 'true') {
    getSvc.isLogin = true;
    getSvc.userId = localStorage.getItem('userId') || '';
    getSvc.isLogin$.next(true);
    // themeSvc.switchTheme(localStorage.getItem('theme') || '');
    return true;
  }

  if (getSvc.isLogin) {
    return true;
  }

  return router.createUrlTree(['/home']);
};
