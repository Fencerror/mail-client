import { Injectable } from '@angular/core';
import { User } from '../interfaces/Shared.interface';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private storageKey = 'users';

  constructor() {
    this.initializeUsers();
  }

  
  private initializeUsers(): void {       //Тут мы инициализируем тестовых пользователей: id, email, password.
    if (!localStorage.getItem(this.storageKey)) {
      const defaultUsers: User[] = [
        { id: 1, email: 'user1@gmail.com', password: '123456', phoneNumber: '+77777777771', emailSpam: [] },  
        { id: 2, email: 'user2@gmail.com', password: '222222', phoneNumber: '+77777777772', emailSpam: []  },
        { id: 3, email: 'user3@gmail.com', password: '333333', phoneNumber: '+77777777773', emailSpam:[] },
        { id: 4, email: 'user4@gmail.com', password: '444444', phoneNumber: '+77777777774', emailSpam:[] },
        { id: 5, email: 'user5@gmail.com', password: '555555', phoneNumber: '+77777777775', emailSpam:[] },
        { id: 6, email: 'tyghrtzwrcv@gmail.com', password: '654321', phoneNumber: '+77777777777', emailSpam: [] },
      ];
      localStorage.setItem(this.storageKey, JSON.stringify(defaultUsers));
    }
  }

  getUsers(): User[] {
    const users = localStorage.getItem(this.storageKey);
    return users ? JSON.parse(users) : [];
  }

  refreshUsers():void{
    this.initializeUsers();
  }
  
  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(user => user.email === email);
  }

  updateUsers(users: User[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }


  getNextUserId(): number {
    const users = this.getUsers();
    const maxId = users.reduce((max, user) => user.id > max ? user.id : max, 0);
    return maxId + 1; //Решил сделать автоинкремент id вместо date.now()
  }
}
