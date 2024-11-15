import { Component, ElementRef, inject, SimpleChanges, ViewChild, HostListener } from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardConversaPreviewComponent } from "../../components/card-conversa-preview/card-conversa-preview.component";
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { ConversasService } from '../../services/conversas/conversas.service';
import { ConversaPreview } from '../../models/preview/conversa-preview';
import {MatDialog} from '@angular/material/dialog';
import { LoginComponent } from '../auth/login/login.component';
import { AuthService } from '../../services/auth/auth.service';
import { DrawerControlService } from '../../services/drawer/drawer-control.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home-container',
  standalone: true,
  imports: [
    RouterOutlet, 
    MatSidenavModule, 
    CommonModule, 
    CardConversaPreviewComponent, 
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './home-container.component.html',
  styleUrl: './home-container.component.css'
})
export class HomeContainerComponent{
  @ViewChild('scrollTopTarget') private scrollTopTarget?: ElementRef;
  @ViewChild('drawer') private drawer?: ElementRef;
  
  username: string = 'Wallison';
  conversasPreview: ConversaPreview[] = [];
  selectedConversationId: string = '';
  isGlobalLoading: boolean = true;
  mayaLogoText: string = "Iniciar nova conversa";

  constructor(
    private conversasService: ConversasService,
    public authService: AuthService, 
    private router: Router,
    public drawerControlService: DrawerControlService
  ) {
  }

  ngAfterViewInit() {
    this.onLoadWidthSize(window.innerWidth);
  }

  ngOnInit(): void {
    this.authService.token.subscribe(token => {
      if(this.authService.isLoggedIn() && token !== ''){
        this.getSelectedConversationBySession();
        this.getConversations();
        this.mayaLogoText = "Iniciar nova conversa";
    
        this.conversasService.getUpdateConversations().subscribe(() => {
          if(this.authService.isLoggedIn() && token !== ''){
            this.getConversations();
            this.getSelectedConversationBySession();
            this.mayaLogoText = "Iniciar nova conversa";
          }
        });
      }else{
        this.conversasPreview = [];
        this.mayaLogoText = "Entre para falar comigo!";
      }
    })

    window.addEventListener('beforeunload', this.saveDataInSession.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', this.saveDataInSession.bind(this));
  }

  saveDataInSession(event: BeforeUnloadEvent) {
    sessionStorage.setItem('token', this.authService.token.getValue() ?? '');
    sessionStorage.setItem('username', this.authService.username.getValue() ?? '');
  }

  getConversations(){
    this.conversasService.getConversations()
    .then(conversas => {
      this.conversasPreview = conversas.data;
      this.scrollToTop()
    })
  }

  getSelectedConversationBySession(){
    if(sessionStorage.getItem('lastConversationId')){
      this.selectedConversationId = sessionStorage.getItem('lastConversationId') ?? '';
    }else{
      this.selectedConversationId = '';
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

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const screenWidth = (event.target as Window).innerWidth;
    this.onLoadWidthSize(screenWidth);
  }

  onLoadWidthSize(screenWidth: number){
    if(screenWidth <= 900){
      this.drawerControlService.hideDrawer();
    }else{
      this.drawerControlService.showDrawer();
      this.drawerControlService.hideMenuIcon();
    }
  }
}
