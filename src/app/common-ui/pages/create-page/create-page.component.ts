import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { EmailService } from 'app/common-ui/data/services/email.service';
import { Router, NavigationStart, RouterModule, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'app/common-ui/data/services/auth.service';
import { Email } from 'app/common-ui/data/interfaces/Shared.interface';
import { Subscription, debounceTime, filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UserService } from 'app/common-ui/data/services/user.service';
import EditorJS from '@editorjs/editorjs';
import { AlertService } from 'app/common-ui/data/services/alert.service';

@Component({
  selector: 'app-create-page',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-page.component.html',
  styleUrls: ['./create-page.component.scss']
})
export class CreatePageComponent {
  @ViewChild('editor') editorRef!: ElementRef;
  private editor!: EditorJS;

  authService: AuthService = inject(AuthService);
  emailService: EmailService = inject(EmailService);
  userService: UserService = inject(UserService);
  alertService: AlertService = inject(AlertService);
  router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  isReplying: boolean = false;
  emailNotFound: boolean = false; 
  loggedUser: { id: number; email: string } | null = null;
  draftId: number | null = null;
  err: string | null = null;
  routerSub: Subscription | null = null;
  form = new FormGroup({
    subject: new FormControl('', Validators.required),
    to: new FormControl('', [Validators.required, Validators.email]),
    body: new FormControl('', Validators.required)
  });

  
  ngOnInit(): void {
    
    this.loggedUser = this.authService.getLoggedUser();
    if (!this.loggedUser) {                     //Проверка на авторизацию.
      this.alertService.show('Черновик сохранён');
      this.router.navigateByUrl('/login');
    }

    this.loadDrafts();

    this.form.get('to')?.valueChanges.pipe(
      debounceTime(3000)
    ).subscribe(value=> {
      this.userExists(String(value));       //Проверяем, что получатель существует, в процессе заполнения формы и выводим ошибку, если нет.
    });

    this.route.queryParams.subscribe(params =>{
      const replyToId = params['replyTo'];
      const draftId = params['draftId'];

      if(replyToId){                //Заполняем получателя, если это ответ на письмо.
        const originalEmail = this.emailService.getEmailById(Number(replyToId));
        if (originalEmail){
          this.isReplying = true;
          this.form.setValue({
            subject: '',
            to: originalEmail.from,
            body: '',
          })
        }
      }else if(draftId){            //Заполняем данные черновика, если это работа с черновиком.
        const draft = this.emailService.getEmailById(Number(draftId));
        if(draft){
          this.draftId = draft.id;
          this.form.setValue({
            subject: draft.subject,
            to: draft.to,
            body: draft.body
          })
        }
      }
    })

    this.routerSub = this.router.events.pipe(    // Подписка на смену маршрута для сохранения черновиков
      filter(event => event instanceof NavigationStart),
      debounceTime(300) 
    ).subscribe(() => this.saveDraft());

    
  }


  ngAfterViewInit(): void {
    this.editor = new EditorJS({
      holder: this.editorRef.nativeElement,
      placeholder: 'Введите текст письма...',
      onChange: async () => {
        await this.setBodyValue(); // Автоматически сохраняем body при изменении контента
      }
    });
  }
  getEditorData(): void {
    this.editor.save().then((outputData) => {
      console.log('Сохраненные данные:', outputData);
    }).catch((error) => {
      console.log('Ошибка:', error);
    });
  }

  setBodyValue(): Promise<void> {   //Сохраняем данные редактора в форму.
    return this.editor.save().then(outputData => {
      this.form.patchValue({ body: JSON.stringify(outputData) });
    }).catch(error => {
      console.error('Ошибка при сохранении данных редактора:', error);
    });
  }

  userExists(email:string): void{   //Нужно для мониторинга поля to, проверяем, что такой пользователь существует.
    if(!email){
      this.emailNotFound = false;
      return;
    }
    this.emailNotFound = !this.userService.getUserByEmail(email);
  }

  loadDrafts() {
    const drafts = this.emailService.getDrafts();
    if (drafts.length > 0) {
      const lastDraft = drafts[drafts.length - 1];
      this.draftId = lastDraft.id;
      this.form.setValue({
        subject: lastDraft.subject,
        to: lastDraft.to,
        body: lastDraft.body
      });
    }
  }

  saveDraft(): void {
    if (!this.loggedUser || this.form.pristine) return; // Если форма не изменялась то не сохраняем черновик, тк он пустой.
    const draft: Email = {
      id: Date.now(), 
      to: this.form.get('to')?.value ?? '',
      subject: this.form.get('subject')?.value ?? '',
      from: this.loggedUser.email,
      body: this.form.get('body')?.value ?? '',
      date: new Date().toLocaleString()
    };

    this.emailService.saveDraft(draft);
    this.alertService.show('Черновик сохранён');
  }

  onSubmit(): void {
  this.setBodyValue().then(() => {
    if (this.form.invalid || !this.loggedUser) return;

    const ToEmail = this.form.get('to')?.value ?? '';
    const To = this.userService.getUserByEmail(ToEmail);
    if (!To) {
      this.err = 'Пользователь с таким email не найден.';
      return;
    }

    const newEmail: Email = {
      id: Date.now(),
      to: ToEmail,
      subject: this.form.get('subject')?.value ?? '',
      from: this.loggedUser?.email ?? '',
      body: this.form.get('body')?.value ?? '', 
      date: new Date().toLocaleString()
    };

    this.emailService.addEmail(newEmail);
    this.alertService.show('Письмо отправлено');
    if (this.draftId) this.emailService.deleteDraft(this.draftId);

    this.form.reset();
    this.draftId = null; //очистка формы перед отправкой.

    this.router.navigateByUrl('/inbox');
  });
}


  ngOnDestroy(): void {
    this.routerSub?.unsubscribe(); //отписываемся
  }
}
