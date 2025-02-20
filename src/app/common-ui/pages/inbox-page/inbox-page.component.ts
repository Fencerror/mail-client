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
  loggedUser: { id: number; email: string } | null = null;
  ngOnInit(): void {
    this.loggedUser = this.authService.getLoggedUser();
    this.loadEmails();
  }

  loadEmails(): void {
    const allEmails = this.emailService.getEmails();
    // Фильтруем письма: показываем только те, где поле "to" совпадает с email текущего пользователя
    if (this.loggedUser) {
      this.emails = allEmails.filter(email => email.to === this.loggedUser!.email);
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
  
  deleteEmail(id: number): void {
    this.emailService.deleteEmail(id);
    this.emailService.selectEmail(null); // Сбрасываем выбранное письмо
    this.alertService.show('Письмо удалено');
    this.loadEmails();
  }


  selectEmail(email: Email): void {
    this.emailService.setSelectedEmail(email);
  }
}
