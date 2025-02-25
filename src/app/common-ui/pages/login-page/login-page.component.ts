import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../data/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { inject } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from 'app/common-ui/data/services/user.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
  authService: AuthService = inject(AuthService);
  router: Router = inject(Router);
  userService: UserService = inject(UserService);
  form: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required, Validators.minLength(6)]),
  });

  errorMessage: string | null = null;

  ngOnInit():void{
    this.userService.refreshUsers();
  }
  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const success = this.authService.login(this.form.value);

    if (success) {
      this.router.navigateByUrl('layout');
    } else {
      this.errorMessage = 'Неверные почта или пароль';
    }
  }
}
