import { Component, inject } from '@angular/core';
import { EmailService } from 'app/common-ui/data/services/email.service';
import { AuthService } from 'app/common-ui/data/services/auth.service';
import { Email } from 'app/common-ui/data/interfaces/Shared.interface';
import { AlertService } from 'app/common-ui/data/services/alert.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-spam-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './spam-page.component.html',
  styleUrl: './spam-page.component.scss'
})
export class SpamPageComponent {
  emails: Email[] = [];
  emailService: EmailService = inject(EmailService);
  authService: AuthService = inject(AuthService);
  alertService: AlertService = inject(AlertService);
  loggedUser: {id: number; email: string; emailSpam: string[]} | null = null;
  emailSpam: string[] = [];
  ngOnInit(): void {
    this.loggedUser = this.authService.getLoggedUser();
    this.emailSpam = this.loggedUser?.emailSpam || [];
    this.loadEmails();
  }

  loadEmails():void {
    const allEmails = this.emailService.getEmails();
    // Фильтруем письма: показываем только те, где поле "from" совпадает с одним из элементов массива emailSpam.
    if (this.loggedUser) {
      this.emails = allEmails.filter(email => this.emailSpam.find(spam => spam === email.from));
    }else{
      this.emails = [];
    }
  }

parseBody(body:string): string{
  try{
    const parsed = JSON.parse(body);
    return parsed.blocks.map((block: any) => block.data.text).join('\n');
  }catch(error){
    console.log('Ошибка парсинга JSON:', error);
    return body;
  }
}

  deleteEmail(id: number):void{
    this.emailService.deleteEmail(id);
    this.emailService.selectEmail(null);
    this.alertService.show('Письмо удалено');
    this.loadEmails();
  }

  getReversedEmails(){
    return this.emails.slice().reverse();
  }

  selectEmail(email:Email):void{
    this.emailService.selectEmail(email);
  }

  returnFromSpam(from:string): void{
    if(this.loggedUser){
      const updatedUser = {
        ...this.loggedUser,
        emailSpam: this.loggedUser.emailSpam.filter(email => email !== from) // Удаляем email из списка
      };
      localStorage.setItem('loggedUser', JSON.stringify(updatedUser));
      this.loggedUser = updatedUser;
    }
    this.loadEmails();
}

}
