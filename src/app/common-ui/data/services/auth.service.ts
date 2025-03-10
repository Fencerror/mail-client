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
  private verificationCodeKey = 'verificationCode';
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
    if (localUser) {
      return JSON.parse(localUser) as User;
    }else{ 
      return null;
    }
  }
  
  verifyPhoneNumber(phoneNumber: string): boolean {
    const user = this.userService.getUsers().find(user => user.phoneNumber === phoneNumber);
    if (user) {
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem(this.verificationCodeKey, verificationCode);
      console.log('Код подтверждения:', verificationCode); 
      //В условиях использования localStorage
      //Решил реализовать вывод кода подвтерждения в консоль.
      //В дальнейшем при расширении проекта (добавлении backend-а) 
      //Можно будет реализовать отправку кода на номер телефона.
      return true;
    }
    return false;
  }

  checkVerificationCode(code: string): boolean {
    const storedCode = localStorage.getItem(this.verificationCodeKey);
    return storedCode === code;
  }

  updatePassword(phoneNumber: string, newPassword: string): boolean {
    const users = this.userService.getUsers();
    const userIndex = users.findIndex(user => user.phoneNumber === phoneNumber);
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      this.userService.updateUsers(users);
      return true;
    }
    return false;
  }
  setLoggedUser(user: { id: number; email: string; emailSpam: string[] }): void {
    localStorage.setItem('loggedUser', JSON.stringify(user));
  }
  
}
