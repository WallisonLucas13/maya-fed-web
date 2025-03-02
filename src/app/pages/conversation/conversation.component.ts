import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConversationsService } from '../../services/conversas/conversations.service';
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
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth/auth.service';
import { provideIcons } from '@ng-icons/core';
import { ionAnalytics, ionMenu } from '@ng-icons/ionicons';
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
    MatTooltipModule
],
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.css',
  viewProviders: [provideIcons({ ionMenu, ionAnalytics})]
})
export class ConversationComponent {
  @ViewChild('scrollTarget') private scrollTarget?: ElementRef;
  @ViewChild('scrollTopTarget') private scrollTopTarget?: ElementRef;
  @ViewChild('menuIconTooltip') menuIconTooltip!: MatTooltip;

  conversationId: string | null = null;
  conversation?: Conversa;
  groupedMessages: { [key: string]: Mensagem[] } = {};
  datePipe = new DatePipe('pt-BR');
  messageForm: FormGroup;
  isMessageLoading: boolean = false;
  hideConversation: boolean = false;
  selectedFile: File | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private conversationsService: ConversationsService,
    private loadingService: LoadingService,
    public authService: AuthService,
    public drawerControlService: DrawerControlService,
    private titleService: Title
  ) {
    registerLocaleData(localePt, 'pt-BR');
    this.messageForm = new FormGroup({
      message: new FormControl('', Validators.required),
      file: new FormControl()
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const isNewConversation = sessionStorage.getItem('isNewConversation');
      if(!isNewConversation){
        if (params.get('id') !== 'new') {
          this.conversationId = params.get('id');
          this.conversationsService.setSelectedConversationPreview(this.conversationId ?? '');
          this.getConversation();
          this.selectedFile = null;
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
    const promise = this.conversationsService.getNewConversation().getValue();
    this.conversation = {
      id: '',
      username: '',
      title: '',
      messages: [],
      createdAt: new Date()
    };

    this.selectedFile = promise.file;

    this.addUserMessage(promise.userMessage);
    this.isMessageLoading = true;

    promise.systemSubscription.then(response => {
      const systemMessage = response.data;
      this.conversationId = systemMessage.conversationId;
      sessionStorage.setItem('isNewConversation', "true");
      sessionStorage.setItem('lastConversationId', this.conversationId);

      this.conversationsService.getConversation(this.conversationId)
        .then(response => {
          this.conversation = response.data;
          this.conversation.messages = [];
          this.addUserMessage(promise.userMessage);
          this.addSystemMessage(systemMessage);

          this.isMessageLoading = false;
          this.conversationsService.emitUpdateConversationPreview(this.conversationId ?? '')
          this.router.navigate(['/conversation', this.conversationId], { replaceUrl: true });
          this.drawerControlService.showMenuTooltip();

          setTimeout(() => {
            this.drawerControlService.hideMenuTooltip();
          }, 6000);
        })
    })
  }

  getConversation() {
    this.loadingService.show();
    if (this.conversationId) {
      this.conversationsService.getConversation(this.conversationId)
        .then(response => {
          this.conversation = response.data;
          this.groupMessagesByDate();

          setTimeout(() => {
            this.scrollToBottom();
          }, 300)

          setTimeout(() => {
            this.loadingService.hide();
          }, 800)

          this.titleService.setTitle(response.data.title);
        }).catch(() => {
            this.router.navigate(['/conversation'], { replaceUrl: true });
        })
    }
  }

  groupMessagesByDate(): void {
    this.groupedMessages = this.conversation?.messages.reduce((groups, message) => {
      const messageDate = new Date(message.createdAt);
      const dateKey = this.getDateKey(messageDate);

      if (dateKey) {
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(message);
      }
      return groups;
    }, {} as { [key: string]: any[] }) ?? {};
  }

  getDateKey(date: Date): string {
    if (this.isToday(date)) {
      return 'Hoje';
    } else if (this.isYesterday(date)) {
      return 'Ontem';
    } else {
      return this.datePipe.transform(date, 'dd \'de\' MMMM \'de\' yyyy', 'pt-BR') || '';
    }
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

  isYesterday(date: Date): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  }

  sendMessage(){
    if (this.messageForm.valid && this.loadingService.isHidden()) {
      this.isMessageLoading = true;
      const message = this.messageForm.get('message')?.value;
      this.messageForm.reset();
      this.addUserMessage(message);
      setTimeout(() => {
        this.scrollToBottom();
      }, 200)

      if(this.selectedFile){
        this.conversationsService
        .sendMessageWithFiles(this.conversationId ?? '', message, this.selectedFile)
        .then(response => {
          this.isMessageLoading = false;
          this.addSystemMessage(response.data);

          this.conversationsService.emitUpdateConversationPreview(response.data.conversationId)
        });
        return;
      }

      this.conversationsService
        .sendMessage(this.conversationId ?? '', message)
        .then(response => {
          this.isMessageLoading = false;
          this.addSystemMessage(response.data);
          this.conversationsService.emitUpdateConversationPreview(response.data.conversationId)
        })
    }
  }

  addUserMessage(messageText: string) {
    this.conversation?.messages.push({
      conversationId: this.conversationId ?? '',
      id: Math.random().toString(36).substr(2, 9),
      type: 'USER',
      message: messageText,
      files: this.selectedFile ? [this.selectedFile.name] : [],
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
      files: this.selectedFile ? [this.selectedFile.name] : [],
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

  redirectToAnalytics(){
    this.router.navigate(['/analytics']);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.messageForm.get('file')?.reset();
  }
}
