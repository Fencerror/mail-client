import { Component, OnInit } from '@angular/core';
import { UserService } from 'app/common-ui/data/services/user.service';
import { AuthService } from 'app/common-ui/data/services/auth.service';
import { User } from 'app/common-ui/data/interfaces/Shared.interface';

@Component({
  selector: 'app-profile-page',
  imports: [],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent implements OnInit {
  user: any;
  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit(): void {
    const loggedUser: User | null = this.authService.getLoggedUser();
    if (loggedUser) {
      this.user = this.userService.getUserByEmail(loggedUser.email);
    } else {
      console.error('Пользователь не авторизован.');
    }
  }
}
