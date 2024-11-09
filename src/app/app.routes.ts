import { Routes } from '@angular/router';
import { HomeContainerComponent } from './pages/home-container/home-container.component';
import { ConversationComponent } from './pages/conversation/conversation.component';
import { NewConversationComponent } from './pages/new-conversation/new-conversation.component';

export const routes: Routes = [
    {path: '', redirectTo: '/conversation',pathMatch: 'full'},
    {path: 'conversation/:id', component: ConversationComponent},
    {path: 'conversation', component: NewConversationComponent}
];
