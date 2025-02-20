import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AccessGuard implements CanActivate {
  router: Router = inject(Router);

  canActivate(): boolean {
    if (localStorage.getItem('loggedUser')) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
