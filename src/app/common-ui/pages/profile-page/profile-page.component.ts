import { Component, inject, OnInit } from '@angular/core';
import { UserService } from 'app/common-ui/data/services/user.service';
import { AuthService } from 'app/common-ui/data/services/auth.service';
import { User } from 'app/common-ui/data/interfaces/Shared.interface';
import {Router} from '@angular/router';

@Component({
  selector: 'app-profile-page',
  imports: [],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent implements OnInit {;
  router: Router = inject (Router);
  userService: UserService = inject(UserService);
  authService: AuthService = inject(AuthService);
  user: User | null = null;
  ngOnInit(): void {
    this.user = this.authService.getLoggedUser();
  }

  changePassword():void{
    this.router.navigate(['/resetPassword']);
  }
}
