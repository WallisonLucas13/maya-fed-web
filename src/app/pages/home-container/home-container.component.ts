import { Component, ElementRef, ViewChild, HostListener, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardConversaPreviewComponent } from "../../components/card-conversa-preview/card-conversa-preview.component";
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { ConversasService } from '../../services/conversas/conversas.service';
import { ConversationPreview } from '../../models/preview/conversa-preview';
import { AuthService } from '../../services/auth/auth.service';
import { DrawerControlService } from '../../services/drawer/drawer-control.service';
import { MatIconModule } from '@angular/material/icon';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { ionCloseSharp } from '@ng-icons/ionicons';
import { Title } from '@angular/platform-browser'; // Importar Title
import { LoadingService } from '../../services/loading/loading.service';
import { NavbarComponent } from "../../components/navbar/navbar.component";

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
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeContainerComponent{
  @ViewChild('scrollTopTarget') private scrollTopTarget?: ElementRef;
  
  username: string = 'Wallison';
  conversationsPreview: ConversationPreview[] = [];
  selectedConversationId: string = '';
  isGlobalLoading: boolean = true;
  mayaLogoText: string = "Iniciar nova conversa";

  constructor(
    private conversasService: ConversasService,
    public authService: AuthService, 
    private router: Router,
    public drawerControlService: DrawerControlService,
    private titleService: Title,
    private loadingService: LoadingService
  ) {
  }

  ngAfterViewInit() {
    this.onLoadWidthSize(window.innerWidth);
  }

  ngOnInit(): void {
    this.authService.token.subscribe(token => {
      if(this.authService.isLoggedIn() && token !== ''){
        this.loadingService.show();

        this.getSelectedConversationBySession();
        this.getConversationsPreview();
        this.mayaLogoText = "Iniciar nova conversa";
    
        this.handleUpdateConversationPreview(token)
      }else{
        this.conversationsPreview = [];
        this.mayaLogoText = "Entre para falar comigo!";
      }
    })

    window.addEventListener('beforeunload', this.saveDataInSession.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', this.saveDataInSession.bind(this));
  }

  handleUpdateConversationPreview(token: string){
    this.conversasService.getUpdateConversationPreview().subscribe(response => {
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
    }
  }

  getConversationsPreview(){
    this.conversasService.getConversationsPreview()
    .then(conversations => {
      this.conversationsPreview = conversations.data;
      this.loadingService.hide();
      this.scrollToTop()
      sessionStorage.setItem('conversationsPreview', JSON.stringify(this.conversationsPreview));
    })
  }

  getConversationPreview(conversationId: string){
    this.conversasService.getConversationPreview(conversationId)
    .then(response => {
      this.updateConversationsPreviewList(response.data);
      this.selectedConversationId = response.data.id;
    })
  }

  getSelectedConversationBySession(){
    if(sessionStorage.getItem('lastConversationId')){
      this.selectedConversationId = sessionStorage.getItem('lastConversationId') ?? '';
    }else{
      this.selectedConversationId = '';
    }
  }

  updateConversationsPreviewList(conversationPreview: ConversationPreview) {
    const index = this.conversationsPreview.findIndex(conversation => conversation.id === conversationPreview.id);
    if (index !== -1) {
      const [removedItem] = this.conversationsPreview.splice(index, 1);
      this.conversationsPreview.unshift(conversationPreview);
    } else {
      this.conversationsPreview.unshift(conversationPreview);
    }
  }

  handleCardClick(id: string){
    this.selectedConversationId = id;
    sessionStorage.setItem('lastConversationId', id);
    this.router.navigate(['/conversation', id]);
    
    if(this.drawerControlService.isAndroid.getValue()){
      this.drawerControlService.hideDrawer();
    }
  }

  redirectToNewConversation(){
    if(!this.authService.isLoggedIn())return;
    sessionStorage.clear();
    this.selectedConversationId = '';
    this.router.navigate(['/conversation']);
    this.titleService.setTitle("Fale com a Maya")

    if(this.drawerControlService.isAndroid.getValue()){
      this.drawerControlService.hideDrawer();
    }
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
