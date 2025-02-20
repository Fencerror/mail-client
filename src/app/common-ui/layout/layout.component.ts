import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationStart, RouterLinkActive } from '@angular/router';
import { AuthService } from '../data/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Email } from '../data/interfaces/Shared.interface';
import { EmailService } from '../data/services/email.service';
import { Subscription, filter } from 'rxjs';
import { AlertService } from 'app/common-ui/data/services/alert.service';
import { UserService } from '../data/services/user.service';
import { AlertComponent } from '../components/alert/alert.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink, AlertComponent, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  authService: AuthService = inject(AuthService);
  userService: UserService = inject(UserService);
  router: Router = inject(Router);
  loggedUser: any;
  replyCondition: boolean = false;
  email:Email | null = null;
  selectedEmail: Email | null = null; 
  private routerSub: Subscription | null = null;
  emailService: EmailService = inject (EmailService);
  alertService: AlertService = inject(AlertService);
  menuItems = [               //Множество разделов с сылками на них.
    { 
      label: 'Написать', 
      link: '/create' 
    },
    { 
      label: 'Входящие', 
      link: '/inbox' 
    },
    {
      label: 'Исходящие',
      link: '/outbox'
    },
    {
      label: 'Черновики',
      link: '/drafts'
    }
  ];

  
  ngOnInit(): void {
    this.loggedUser = this.authService.getLoggedUser();
    this.emailService.selectedEmail$.subscribe(email => { //Подписываемся на просмотр письма.
      this.selectedEmail = email;
    });
    // Подписываемся на события начала навигации и сбрасываем выбранное письмо при переходе на новый маршрут.
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationStart) //
    ).subscribe(() => {
      this.emailService.selectEmail(null);
    });
  }


  // Парсит тело письма с проверкой: если строка пуста или не выглядит как JSON – возвращает её как есть.
  parseBody(body: string): string {
    const trimmed = body.trim();
    if (!trimmed || !trimmed.startsWith('{')) {
      return trimmed;
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.blocks && Array.isArray(parsed.blocks)) {
        return parsed.blocks.map((block: any) => block.data.text || '').join('\n');
      }
      return trimmed;
    } catch (error) {
      console.error('Ошибка парсинга JSON:', error);
      return trimmed;
    }
  }
  
  continueDraft(): void {
    if (this.selectedEmail) {
      this.router.navigate(['/create'], {
        queryParams: {draftid : this.selectedEmail.id}  //Обработка кнопки "продолжить" для черновика - передаём id черновика.
      });
    }
  }
  
  canBeReplied(): boolean { // Показываем кнопку "Ответить", если отправитель письма не совпадает с автором
    if (this.loggedUser.email !== this.selectedEmail?.from && !this.emailService.isDraft(this.selectedEmail!.id)) { 
      return true;
    }
    return false;
  }
  logout(): void {
    this.authService.logout();
  }

  reply(): void {
    if (this.selectedEmail) {
      this.router.navigate(['/create'], {queryParams: {replyTo:this.selectedEmail.id}}); //Здесь тоже.
    }
  }

  sendDraft(): void {
    if (this.selectedEmail && this.userService.getUserByEmail(this.selectedEmail.to)) {
      // Формируем отправляемое письмо на основе черновика.
      const draft = this.selectedEmail;
      const newEmail: Email = {
        id: Date.now(),
        to: draft.to,
        subject: draft.subject,
        from: draft.from,
        body: draft.body,
        date: new Date().toLocaleString()
      };
      this.emailService.addEmail(newEmail);
      this.emailService.deleteDraft(draft.id);  // Удаляем черновик
      this.emailService.selectEmail(null); // Сбрасываем выбранное письмо
      this.alertService.show('Черновик отправлен');
    }
  }

}