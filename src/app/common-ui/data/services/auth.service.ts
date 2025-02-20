import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { User } from '../interfaces/Shared.interface';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userService: UserService = inject(UserService);
  private router: Router = inject(Router);
  private storageKey = 'loggedUser';

  login(payload: { email: string; password: string }): boolean {
    const foundUser = this.userService.getUsers().find(
      user => user.email === payload.email && user.password === payload.password
    );

    if (foundUser) {
      localStorage.setItem(this.storageKey, JSON.stringify(foundUser));
      return true; 
    }
    return false; 
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.router.navigateByUrl('/login');
  }

  getLoggedUser(): User | null {
    const localUser = localStorage.getItem(this.storageKey);
    return localUser ? (JSON.parse(localUser) as User) : null;
  }
}
