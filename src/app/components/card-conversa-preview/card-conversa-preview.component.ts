import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ConversationPreview } from '../../models/preview/conversa-preview';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

@Component({
  selector: 'app-card-conversa-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-conversa-preview.component.html',
  styleUrl: './card-conversa-preview.component.css'
})
export class CardConversaPreviewComponent {
  @Input() conversationPreview?: ConversationPreview;
  @Input() isSelected?: boolean = false;
  @Output() cardClick = new EventEmitter<string>();
  datePipe = new DatePipe('pt-BR');

  constructor() {
    registerLocaleData(localePt, 'pt-BR');
  }
  
  handleClick(conversationId: string){
    if (this.conversationPreview) {
      this.cardClick.emit(conversationId);
    }
  }

  formatDate(date?: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const dateToFormat = new Date(date ?? new Date());

    if (this.isSameDay(dateToFormat, today)) {
      return `Hoje - ${this.datePipe.transform(dateToFormat, 'HH:mm')}`;
    } else if (this.isSameDay(dateToFormat, yesterday)) {
      return `Ontem - ${this.datePipe.transform(dateToFormat, 'HH:mm')}`;
    } else {
      return this.datePipe.transform(dateToFormat, 'dd/MM/yyyy - HH:mm') || '';
    }
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
}
