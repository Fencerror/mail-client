import { Injectable, inject } from '@angular/core';
import { UserService } from './user.service';
import { User } from '../interfaces/Shared.interface';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private userService: UserService = inject(UserService);
  private storageKey = 'loggedUser';

  register(payload: { email: string; phoneNumber:string; password: string; passwordConfirm: string; }): boolean {
    const foundUser = this.userService.getUserByEmail(payload.email);

    if (foundUser) {
      return false;
    } else {
      const newUser: User = {
        id: this.userService.getNextUserId(), // Используем метод для получения следующего id
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        password: payload.password,
      };
      const users = this.userService.getUsers();
      users.push(newUser);
      this.userService.updateUsers(users);
      localStorage.setItem(this.storageKey, JSON.stringify(newUser));
      return true;
    }
  }
}
