import { Component, ElementRef, ViewChild, HostListener, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardConversaPreviewComponent } from "../../components/card-conversa-preview/card-conversa-preview.component";
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { ConversationsService } from '../../services/conversas/conversations.service';
import { ConversationPreview } from '../../models/preview/conversa-preview';
import { AuthService } from '../../services/auth/auth.service';
import { DrawerControlService } from '../../services/drawer/drawer-control.service';
import { MatIconModule } from '@angular/material/icon';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { ionCloseSharp } from '@ng-icons/ionicons';
import { Title } from '@angular/platform-browser'; // Importar Title
import { LoadingService } from '../../services/loading/loading.service';
import { NavbarComponent } from "../../components/navbar/navbar.component";


export enum BehaviorEnum {
  AUTO = 'auto',
  SMOOTH = 'smooth',
};

@Component({
  selector: 'app-home-container',
  standalone: true,
  imports: [
    RouterOutlet,
    MatSidenavModule,
    CommonModule,
    CardConversaPreviewComponent,
    MatProgressSpinnerModule,
    MatIconModule,
    NavbarComponent
],
  templateUrl: './home-container.component.html',
  styleUrl: './home-container.component.css',
  providers: [provideIcons({ ionCloseSharp })],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeContainerComponent{
    
  username: string = 'Wallison';
  conversationsPreview: ConversationPreview[] = [];
  isGlobalLoading: boolean = true;
  mayaLogoText: string = "Iniciar nova conversa";

  constructor(
    public conversationsService: ConversationsService,
    public authService: AuthService, 
    private router: Router,
    public drawerControlService: DrawerControlService,
    private titleService: Title,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngAfterViewInit() {
    this.onLoadWidthSize(window.innerWidth);
  }

  ngOnInit(): void {
    this.authService.token.subscribe(token => {
      if(this.authService.isLoggedIn() && token !== ''){
        this.loadingService.show();

        this.getConversationsPreviewFromSession();
        this.getSelectedConversationPreviewBySession();
        this.getConversationsPreview();
        this.mayaLogoText = "Iniciar nova conversa";
      
        this.handleUpdateConversationPreview(token);
      }else{
        this.conversationsPreview = [];
        this.mayaLogoText = "Entre para falar comigo!";
      }
      this.cdr.detectChanges();
    });

    window.addEventListener('beforeunload', this.saveDataInSession.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', this.saveDataInSession.bind(this));
  }

  handleUpdateConversationPreview(token: string){
    this.conversationsService.getUpdateConversationPreview().subscribe(response => {
      if(this.authService.isLoggedIn() && token !== '' && response){
        this.getConversationPreview(response);
      }
    });
  }

  saveDataInSession(event: BeforeUnloadEvent) {
    sessionStorage.setItem('token', this.authService.token.getValue() ?? '');
    sessionStorage.setItem('username', this.authService.username.getValue() ?? '');
    this.conversationsPreview = [];
  }

  getConversationsPreviewFromSession(){
    const data = sessionStorage.getItem('conversationsPreview');
    if(data){
      const previews = JSON.parse(sessionStorage.getItem('conversationsPreview') ?? '');
      this.conversationsPreview = previews;
      this.loadingService.hide();
      this.cdr.detectChanges();
    }
  }

  getConversationsPreview(){
    this.conversationsService.getConversationsPreview()
    .then(conversations => {
      this.conversationsPreview = conversations.data;
      this.loadingService.hide();
      sessionStorage.setItem('conversationsPreview', JSON.stringify(this.conversationsPreview));
      this.cdr.detectChanges();
    })
  }

  getConversationPreview(conversationId: string){
    this.conversationsService.getConversationPreview(conversationId)
    .then(response => {
      this.updateConversationsPreviewList(response.data);
      this.conversationsService
      .setSelectedConversationPreview(response.data.id);
      sessionStorage.setItem('conversationsPreview', JSON.stringify(this.conversationsPreview));

      this.scrollToConversationPreview(BehaviorEnum.SMOOTH);
      this.cdr.detectChanges();
    })
  }

  getSelectedConversationPreviewBySession(){
    const conversationPreviewId = sessionStorage.getItem('lastConversationId') ?? '';
    this.conversationsService
      .setSelectedConversationPreview(conversationPreviewId);
      
      setTimeout(() => {
        this.scrollToConversationPreview(BehaviorEnum.AUTO);
      }, 300);
  }

  updateConversationsPreviewList(conversationPreview: ConversationPreview) {
    const index = this.conversationsPreview.findIndex(conversation => conversation.id === conversationPreview.id);
    if (index !== -1) {
      const [removedItem] = this.conversationsPreview.splice(index, 1);
      this.conversationsPreview.unshift(conversationPreview);
    } else {
      this.conversationsPreview.unshift(conversationPreview);
    }
    this.cdr.detectChanges();
  }

  onCardClick(id: string){
    this.conversationsService
      .setSelectedConversationPreview(id)
    sessionStorage.setItem('lastConversationId', id);
    this.loadingService.show();
    this.router.navigate(['/conversation', id]);
    
    if(this.drawerControlService.isAndroid.getValue()){
      this.drawerControlService.hideDrawer();
    }
  }

  redirectToNewConversation(){
    if(!this.authService.isLoggedIn())return;
    sessionStorage.clear();
    this.conversationsService
      .setSelectedConversationPreview('');
    this.router.navigate(['/conversation']);
    this.titleService.setTitle("Fale com a Maya")

    if(this.drawerControlService.isAndroid.getValue()){
      this.drawerControlService.hideDrawer();
    }
  }

  scrollToConversationPreview(behavior: BehaviorEnum): void {
    try {
      const refSelectedPreview = document.getElementById("refSelectedPreview") as HTMLElement;
      if(refSelectedPreview){
        refSelectedPreview.scrollIntoView({ behavior: behavior, block: 'start' });
      }
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
    if(screenWidth <= 1100){
      this.drawerControlService.hideDrawer();
      this.drawerControlService.setIsAndroid(true);
    }else{
      this.drawerControlService.showDrawer();
      this.drawerControlService.hideMenuIcon();
      this.drawerControlService.setIsAndroid(false);
    }
  }

  redirectToLogin(){
    this.router.navigate(['/login']);
    setTimeout(() => {
      this.drawerControlService.toggleDrawer();
    }, 200)
  }
}
