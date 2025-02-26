import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from 'app/common-ui/data/services/auth.service';
import { AlertService } from 'app/common-ui/data/services/alert.service';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './reset-password-page.component.html',
  styleUrl: './reset-password-page.component.scss'
})
export class ResetPasswordPageComponent {
  authService: AuthService = inject(AuthService);
  alertService: AlertService = inject(AlertService);
  router: Router = inject(Router);
  showVerificationField: boolean = false;
  showNewPasswordFields: boolean = false;

  form: FormGroup = new FormGroup({
    phoneNumber: new FormControl(null, [Validators.required, Validators.minLength(12), Validators.maxLength(12)]),
    verificationCode: new FormControl({ value: null, disabled: true }, [Validators.required]),
    newPassword: new FormControl({ value: null, disabled: true }, [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl({ value: null, disabled: true }, [Validators.required, Validators.minLength(6)]),
  });
  errorMessage: string | undefined = '';


  onSubmit() {
    if (this.form.invalid) {
      return;
    }
    const phoneNumber = this.form.get('phoneNumber')?.value;
    if (!this.showVerificationField) {

      if (this.authService.verifyPhoneNumber(phoneNumber)) {
        this.showVerificationField = true;
        this.form.get('verificationCode')?.enable();
        this.form.get('phoneNumber')?.disable(); 
        this.alertService.show('Код подтверждения отправлен');
      } else {
        this.errorMessage = 'Пользователь с таким номером не найден';
      }
    } else if (!this.showNewPasswordFields) {

      const verificationCode = this.form.get('verificationCode')?.value;
      if (this.authService.checkVerificationCode(verificationCode)) {
        this.showNewPasswordFields = true;
        this.form.get('newPassword')?.enable();
        this.form.get('confirmPassword')?.enable();
        this.errorMessage = ''; 
        this.alertService.show('Введите новый пароль');
      } else {
        this.errorMessage = 'Неверный код подтверждения';
      }
    } else {

      const newPassword = this.form.get('newPassword')?.value;
      const confirmPassword = this.form.get('confirmPassword')?.value;
      if (newPassword !== confirmPassword) {
        this.errorMessage = 'Пароли не совпадают';
        return;
      }
      if (this.authService.updatePassword(phoneNumber, newPassword)) {
        this.alertService.show('Пароль успешно изменён');
        this.router.navigateByUrl('/login');
      } else {
        this.errorMessage = 'Ошибка при обновлении пароля';
      }
    }
  }
}
