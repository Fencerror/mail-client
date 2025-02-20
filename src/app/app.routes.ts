import { Routes } from '@angular/router';
import { LayoutComponent } from './common-ui/layout/layout.component';
import { LoginPageComponent } from './common-ui/pages/login-page/login-page.component';
import { InboxPageComponent } from './common-ui/pages/inbox-page/inbox-page.component';
import { CreatePageComponent } from './common-ui/pages/create-page/create-page.component';
import { AccessGuard} from './common-ui/data/guards/Access.guard';
import { OutboxPageComponent } from './common-ui/pages/outbox-page/outbox-page.component';
import { DraftsPageComponent } from './common-ui/pages/drafts-page/drafts-page.component';
export const routes: Routes = [
    {
      path: '', component: LayoutComponent, children: [
        {path: '', redirectTo: 'inbox', pathMatch: 'full' },
        {path: 'inbox', component: InboxPageComponent},
        {path: 'create', component: CreatePageComponent},
        {path: 'outbox', component: OutboxPageComponent},
        {path: 'drafts', component: DraftsPageComponent}
      ],
      
      canActivate: [AccessGuard],
    },
    {path: 'login', component: LoginPageComponent },
    { path: '**', redirectTo: 'inbox' } // Обработка 404
];  
