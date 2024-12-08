import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ConversaPreview } from '../../models/preview/conversa-preview';
import { CommonModule, DatePipe } from '@angular/common';

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
  datePipe = new DatePipe('pt-BR');

  constructor() { }
  
  handleClick(conversationId: string){
    if (this.conversaPreview) {
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
