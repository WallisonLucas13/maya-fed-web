import { Routes } from '@angular/router';
import { HomeContainerComponent } from './pages/home-container/home-container.component';
import { ConversationComponent } from './pages/conversation/conversation.component';
import { NewConversationComponent } from './pages/new-conversation/new-conversation.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { RegisterComponent } from './pages/auth/register/register.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';

export const routes: Routes = [
    {path: '', redirectTo: '/conversation', pathMatch: 'full'},
    {path: 'conversation/:id', component: ConversationComponent, canActivate: [AuthGuard]},
    {path: 'conversation', component: NewConversationComponent, canActivate: [AuthGuard]},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'analytics', component: AnalyticsComponent}
];
