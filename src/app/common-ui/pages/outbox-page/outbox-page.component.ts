import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Email } from 'app/common-ui/data/interfaces/Shared.interface';
import { AuthService } from 'app/common-ui/data/services/auth.service';
import { EmailService } from 'app/common-ui/data/services/email.service';

@Component({
  selector: 'app-outbox-page',
  imports: [RouterModule, CommonModule],
  templateUrl: './outbox-page.component.html',
  styleUrl: './outbox-page.component.scss'
})
export class OutboxPageComponent {
  emails: Email[] = [];
  emailService: EmailService = inject(EmailService);
  authService: AuthService = inject(AuthService);
  loggedUser: { id: number; email: string } | null = null;

  ngOnInit(): void {
    this.loggedUser = this.authService.getLoggedUser();
    this.loadEmails();
  }

  loadEmails(): void {
    const allEmails = this.emailService.getEmails();
    if (this.loggedUser) {
      //фильтруем письма: показываем только те, где поле "from" совпадает с email текущего пользователя.
      this.emails = allEmails.filter(email => email.from === this.loggedUser!.email);
    } else {
      this.emails = [];
    }
  }

  parseBody(body: string): string {
    if (!body) {
      return '';
    }
    try {
      const parsed = JSON.parse(body);
      if (parsed && parsed.blocks) {
        return parsed.blocks.map((block: any) => block.data.text).join('\n');
      }
      return body;
    } catch (error) {
      console.error('Ошибка парсинга JSON:', error);
      return body;
    }
  }

  getReversedEmails() {
    return this.emails.slice().reverse();
  }

  deleteEmail(id: number): void {
    this.emailService.deleteEmail(id);
    this.loadEmails();
  }

  selectEmail(email: Email): void {
    this.emailService.setSelectedEmail(email);
  }
}
