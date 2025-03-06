import { Component, inject, OnInit } from '@angular/core';
import { EmailService } from '../../data/services/email.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Email } from 'app/common-ui/data/interfaces/Shared.interface';
import { AuthService } from 'app/common-ui/data/services/auth.service';
import { AlertService } from 'app/common-ui/data/services/alert.service';


@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inbox-page.component.html',
  styleUrls: ['./inbox-page.component.scss']
})
export class InboxPageComponent implements OnInit {
  emails: Email[] = [];
  emailService: EmailService = inject(EmailService);
  authService: AuthService = inject(AuthService);
  alertService: AlertService = inject(AlertService);
  loggedUser: { id: number; email: string; emailSpam: string[] } | null = null;
  emailSpam: string[] = [];
  ngOnInit(): void {
    this.loggedUser = this.authService.getLoggedUser();
    this.emailSpam = this.loggedUser?.emailSpam || [];
    this.loadEmails();
  }

  loadEmails(): void {
    const allEmails = this.emailService.getEmails();
    // Фильтруем письма: показываем только те, где поле "to" совпадает с email текущего пользователя 
    // и письма не из спама.
    if (this.loggedUser) {
      this.emails = allEmails.filter(email => email.to === this.loggedUser!.email && email.from!== this.emailSpam.find(spam => spam === email.from));
    } else {
      this.emails = [];
    }
  }

  parseBody(body: string): string {
    try {
      const parsed = JSON.parse(body);
      return parsed.blocks.map((block: any) => block.data.text).join('\n'); 
    } catch (error) {
      console.error('Ошибка парсинга JSON:', error);
      return body; 
    }
  }
  
  addIntoSpam(from: string): void {
    if (this.loggedUser) {
      const updatedUser = {
        ...this.loggedUser,
        emailSpam: [...(this.loggedUser.emailSpam || []), from] // Добавляем в массив спама или создаём его.
      };
      localStorage.setItem('loggedUser', JSON.stringify(updatedUser));
      this.loggedUser = updatedUser; 
    this.authService.setLoggedUser(updatedUser);
    this.loggedUser = updatedUser;
    this.loadEmails();
  }
}

  deleteEmail(id: number): void {
    this.emailService.deleteEmail(id);
    this.emailService.selectEmail(null); // Сбрасываем выбранное письмо
    this.alertService.show('Письмо удалено');
    this.loadEmails();
  }

  getReversedEmails(){
    return this.emails.slice().reverse();
  }

  selectEmail(email: Email): void {
    this.emailService.setSelectedEmail(email);
  }
}
