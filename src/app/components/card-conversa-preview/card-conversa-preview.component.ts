import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ConversaPreview } from '../../models/preview/conversa-preview';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-conversa-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-conversa-preview.component.html',
  styleUrl: './card-conversa-preview.component.css'
})
export class CardConversaPreviewComponent {
  @Input() conversaPreview?: ConversaPreview;
  @Input() isSelected?: boolean = false;
  @Output() cardClick = new EventEmitter<string>();

  handleClick(conversationId: string){
    if (this.conversaPreview) {
      this.cardClick.emit(conversationId);
    }
  }
}
