import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RegisterService } from 'app/common-ui/data/services/register.service';
import { UserService } from 'app/common-ui/data/services/user.service';
@Component({
  selector: 'app-registration-page',
  imports: [RouterModule, CommonModule,ReactiveFormsModule],
  templateUrl: './registration-page.component.html',
  styleUrl: './registration-page.component.scss'
})
export class RegistrationPageComponent {
  userService: UserService = inject(UserService);
  router: Router = inject(Router);
  registerService: RegisterService = inject(RegisterService);
  form: FormGroup = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required, Validators.minLength(6)]),
    passwordConfirm: new FormControl(null, [Validators.required, Validators.minLength(6)]),
  });
  errorMessage: string | undefined = '';

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    if (this.form.value.password !== this.form.value.passwordConfirm) {
      this.errorMessage = 'Пароли не совпадают';
      return;
    }
    const success = this.registerService.register(this.form.value);

    if (success) {
      this.router.navigateByUrl('login');
    } else {
      this.errorMessage = 'Пользователь с таким email уже существует';
    }
  }
}
