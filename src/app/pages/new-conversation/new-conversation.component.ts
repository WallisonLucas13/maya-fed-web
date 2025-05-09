import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConversationsService } from '../../services/conversas/conversations.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { provideIcons } from '@ng-icons/core';
import { ionMenu } from '@ng-icons/ionicons';
import { DrawerControlService } from '../../services/drawer/drawer-control.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-new-conversation',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, ReactiveFormsModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './new-conversation.component.html',
  styleUrl: './new-conversation.component.css',
  viewProviders: [provideIcons({ ionMenu })]
})
export class NewConversationComponent {
  messageForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private conversasService: ConversationsService,
    private router: Router,
    public authService: AuthService,
    public drawerControlService: DrawerControlService,
  ) {
    this.messageForm = new FormGroup({
      message: new FormControl('', Validators.required),
      file: new FormControl()
    });

    this.selectedFile = null;
  }

  sendMessage() {
    const message = this.messageForm.get('message')?.value;
    if (this.isValidMessageForm()) {
      this.resetTextarea();

      let promisse;

      if(this.selectedFile){
        promisse = this.conversasService
         .sendMessageToNewConversationWithFiles(message, this.selectedFile);
      }else{
        promisse = this.conversasService
        .sendMessageToNewConversation(message);
      }

      this.conversasService.setNewConversation(message, this.selectedFile ?? null, promisse);
      this.router.navigate(['/conversation', 'new']);
    }
  }

  onEnterPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  isValidMessageForm(): boolean{
    const trimmed = this.messageForm.get('message')?.value.trim();
    return trimmed.length > 0 && this.messageForm.valid;
  }

  logout(){
    this.authService.logout();
    sessionStorage.removeItem('lastConversationId');
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

  adjustTextareaHeight(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = '20px';
    textarea.style.height = `${textarea.scrollHeight - 14}px`;
  }

  resetTextarea(): void {
    this.messageForm.reset();
    const textarea = document.querySelector('textarea[formControlName="message"]') as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = '20px';
    }
  }
}
