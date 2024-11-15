import { Component, ElementRef, EventEmitter, Inject, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConversasService } from '../../services/conversas/conversas.service';
import { Conversa } from '../../models/conversation/conversa';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { CardMessageComponent } from "../../components/card-message/card-message.component";
import { Mensagem } from '../../models/conversation/mensagem';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingDotsComponent } from "../../components/loading-dots/loading-dots.component";
import { LoadingService } from '../../services/loading/loading.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth/auth.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { ionMenu } from '@ng-icons/ionicons';
import { DrawerControlService } from '../../services/drawer/drawer-control.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [
    CommonModule,
    CardMessageComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    LoadingDotsComponent,
    MatTooltipModule,
    NgIconComponent
  ],
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.css',
  viewProviders: [provideIcons({ ionMenu })]
})
export class ConversationComponent {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  @ViewChild('scrollTarget') private scrollTarget?: ElementRef;
  @ViewChild('scrollTopTarget') private scrollTopTarget?: ElementRef;

  conversationId: string | null = null;
  conversation?: Conversa;
  groupedMessages: { [key: string]: Mensagem[] } = {};
  datePipe = new DatePipe('pt-BR');
  messageForm: FormGroup;
  isMessageLoading: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private conversasService: ConversasService,
    private loadingService: LoadingService,
    public authService: AuthService,
    public drawerControlService: DrawerControlService,
    private titleService: Title
  ) {
    registerLocaleData(localePt, 'pt-BR');
    this.messageForm = new FormGroup({
      message: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const isNewConversation = sessionStorage.getItem('isNewConversation');
      if(!isNewConversation){
        if (params.get('id') !== 'new') {
          this.conversationId = params.get('id');
          this.getConversation();
        } else {
          this.handleNewConversation();
        }
      }else{
        sessionStorage.removeItem('isNewConversation');
      }
    });
  }

  logout(){
    this.authService.logout();
    sessionStorage.removeItem('lastConversationId');
  }

  handleNewConversation() {
    const promise = this.conversasService.getNewConversation().getValue();
    this.conversation = {
      id: '',
      username: '',
      title: '',
      messages: [],
      createdAt: new Date()
    };

    this.addUserMessage(promise.userMessage);
    this.isMessageLoading = true;

    promise.systemSubscription.then(response => {
      const systemMessage = response.data;
      this.conversationId = systemMessage.conversationId;
      sessionStorage.setItem('isNewConversation', "true");
      sessionStorage.setItem('lastConversationId', this.conversationId);

      this.conversasService.getConversation(this.conversationId)
        .then(response => {
          this.conversation = response.data;
          this.conversation.messages = [];
          this.addUserMessage(promise.userMessage);
          this.addSystemMessage(systemMessage);

          this.isMessageLoading = false;
          this.conversasService.emitUpdateConversations();
          this.router.navigate(['/conversation', this.conversationId], { replaceUrl: true });
        })

      setTimeout(() => {
        this.scrollToBottom();
      }, 500)
    })
  }

  getConversation() {
    this.loadingService.show();
    if (this.conversationId) {
      this.conversasService.getConversation(this.conversationId)
        .then(response => {
          this.conversation = response.data;
          this.groupMessagesByDate();

          setTimeout(() => {
            this.scrollToBottom();
            this.loadingService.hide();
            this.titleService.setTitle(response.data.title);
          }, 800)
        })
    }
  }

  groupMessagesByDate(): void {
    this.groupedMessages = this.conversation?.messages.reduce((groups, message) => {
      let dateKey = this.isToday(new Date(message.createdAt))
        ? 'Hoje'
        : this.datePipe.transform(new Date(message.createdAt), 'dd \'de\' MMMM \'de\' yyyy', 'pt-BR');
      
        if (dateKey) {
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(message);
      }
      return groups;
    }, {} as { [key: string]: Mensagem[] }) ?? {};
  }

  getDates(): string[] {
    return Object.keys(this.groupedMessages);
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  sendMessage() {
    if (this.messageForm.valid && this.loadingService.isHidden()) {
      this.isMessageLoading = true;
      const message = this.messageForm.get('message')?.value;
      this.messageForm.reset();
      this.addUserMessage(message);
      setTimeout(() => {
        this.scrollToBottom();
      }, 200)

      this.conversasService
        .sendMessage(this.conversationId ?? '', message)
        .then(response => {
          this.isMessageLoading = false;
          this.addSystemMessage(response.data);
          this.conversasService.emitUpdateConversations();

          setTimeout(() => {
            this.scrollToBottom();
          }, 500)
        })
    }
  }

  addUserMessage(messageText: string) {
    this.conversation?.messages.push({
      conversationId: this.conversationId ?? '',
      id: Math.random().toString(36).substr(2, 9),
      type: 'USER',
      message: messageText,
      createdAt: new Date()
    });
    this.groupMessagesByDate();
  }

  addSystemMessage(message: Mensagem) {
    this.conversation?.messages.push({
      conversationId: message.conversationId,
      id: message.id,
      type: message.type,
      message: message.message,
      createdAt: new Date
    });
    this.groupMessagesByDate();
  };

  scrollToBottom(): void {
    try {
      this.scrollTarget?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } catch (err) {
      console.error('Scroll to bottom failed', err);
    }
  }

  scrollToTop(): void {
    try {
      this.scrollTopTarget?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } catch (err) {
      console.error('Scroll to top failed', err);
    }
  }
}
