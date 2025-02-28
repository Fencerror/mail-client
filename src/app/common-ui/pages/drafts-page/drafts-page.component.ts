import { Component, inject } from '@angular/core';
import { Email } from 'app/common-ui/data/interfaces/Shared.interface';
import { EmailService } from 'app/common-ui/data/services/email.service';
import { CommonModule } from '@angular/common';
import { AlertService } from 'app/common-ui/data/services/alert.service';
import { AuthService } from 'app/common-ui/data/services/auth.service';

@Component({
  selector: 'app-drafts-page',
  imports: [CommonModule],
  templateUrl: './drafts-page.component.html',
  styleUrl: './drafts-page.component.scss'
})
export class DraftsPageComponent {
  drafts: Email[] = [];
  emailService: EmailService = inject(EmailService);
  alertService: AlertService = inject(AlertService);
  authService: AuthService = inject(AuthService);
  loggedUser: { id: number; email: string } | null = null;

  ngOnInit(): void {
    this.loggedUser = this.authService.getLoggedUser();
    this.loadDrafts();
  }

  loadDrafts(): void {
    if (this.loggedUser) {
      this.drafts = this.emailService.getDraftsByUser(this.loggedUser.email);
    }
  }

  selectDraft(email: Email): void {
    this.emailService.setSelectedEmail(email);
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

  getReversedDrafts() {
    return this.drafts.slice().reverse();
  }

  deleteDraft(id: number): void {
    this.emailService.deleteDraft(id);
    this.emailService.selectEmail(null);
    this.alertService.show('Черновик удален');
    this.loadDrafts();
  }
}
