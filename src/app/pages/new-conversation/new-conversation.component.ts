import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CardMessageComponent } from '../../components/card-message/card-message.component';
import { LoadingDotsComponent } from '../../components/loading-dots/loading-dots.component';
import { ConversasService } from '../../services/conversas/conversas.service';
import { Router } from '@angular/router';
import { LoadingService } from '../../services/loading/loading.service';

@Component({
  selector: 'app-new-conversation',
  standalone: true,
  imports: [CommonModule, CardMessageComponent, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, ReactiveFormsModule, MatProgressSpinnerModule, LoadingDotsComponent, MatTooltipModule],
  templateUrl: './new-conversation.component.html',
  styleUrl: './new-conversation.component.css'
})
export class NewConversationComponent {
  username: string = "Wallison"
  messageForm: FormGroup;

  constructor(
    private conversasService: ConversasService,
    private router: Router,
    private loadingService: LoadingService
  ) {
    this.messageForm = new FormGroup({
      message: new FormControl('', Validators.required)
    });
  }

  sendMessage() {
    const message = this.messageForm.get('message')?.value;
    if (!this.messageForm.controls['message'].invalid) {
      this.messageForm.get('message')?.reset();

      const promisse = this.conversasService
        .sendMessageToNewConversation(this.username, message);

      this.conversasService.setNewConversation(message, promisse);
      this.router.navigate(['/conversation', 'new']);
    }
  }
}
