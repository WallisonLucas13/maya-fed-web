import { Component, ElementRef, SimpleChanges, ViewChild } from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardConversaPreviewComponent } from "../../components/card-conversa-preview/card-conversa-preview.component";
import { first, map } from 'rxjs';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { ConversasService } from '../../services/conversas/conversas.service';
import { ConversaPreview } from '../../models/preview/conversa-preview';

@Component({
  selector: 'app-home-container',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, CommonModule, CardConversaPreviewComponent, MatProgressSpinnerModule],
  templateUrl: './home-container.component.html',
  styleUrl: './home-container.component.css'
})
export class HomeContainerComponent{
  @ViewChild('scrollTopTarget') private scrollTopTarget?: ElementRef;
  
  username: string = 'Wallison';
  conversasPreview: ConversaPreview[] = [];
  selectedConversationId: string = '';
  isGlobalLoading: boolean = true;

  constructor(
    private conversasService: ConversasService, 
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.getSelectedConversationBySession();
    this.getConversations();

    this.conversasService.getUpdateConversations().subscribe(() => {
      this.getConversations();
      this.getSelectedConversationBySession();
    });
  }

  getConversations(){
    this.conversasService.getConversations(this.username)
    .then(conversas => {
      this.conversasPreview = conversas.data;
      this.scrollToTop()
    })
  }

  getSelectedConversationBySession(){
    if(sessionStorage.getItem('lastConversationId')){
      this.selectedConversationId = sessionStorage.getItem('lastConversationId') ?? '';
    }
  }

  handleCardClick(id: string){
    this.selectedConversationId = id;
    sessionStorage.setItem('lastConversationId', id);
    this.router.navigate(['/conversation', id]);
  }

  redirectToNewConversation(){
    sessionStorage.clear();
    this.selectedConversationId = '';
    this.router.navigate(['/conversation']);
  }

  scrollToTop(): void {
    try {
      this.scrollTopTarget?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } catch (err) {
      console.error('Scroll to top failed', err);
    }
  }
}
