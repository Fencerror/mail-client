import { Component, inject } from '@angular/core';
import { Email } from 'app/common-ui/data/interfaces/Shared.interface';
import { EmailService } from 'app/common-ui/data/services/email.service';
import { CommonModule } from '@angular/common';
import { AlertService } from 'app/common-ui/data/services/alert.service';

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
  ngOnInit(): void {              
    this.drafts = this.emailService.getDrafts(); //Для отображения черновиков сделал отдельный метод в emailService.
  
    this.loadDrafts(); 
  }

  loadDrafts(): void {
    this.drafts = this.emailService.getDrafts();
  }

  selectDraft(email: Email): void {
    this.emailService.setSelectedEmail(email);
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
  
  deleteDraft(id: number): void{
    this.emailService.deleteDraft(id);
    this.emailService.selectEmail(null); // Сбрасываем выбранное письмо
    this.alertService.show('Черновик удален');
    this.loadDrafts();
  }
}
