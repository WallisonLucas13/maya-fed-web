import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from '../../services/loading/loading.service';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth/auth.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { ionAnalytics, ionMenu } from '@ng-icons/ionicons';
import { DrawerControlService } from '../../services/drawer/drawer-control.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatIconModule,
    NgIconComponent,
    MatTooltipModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @ViewChild('menuIconTooltip') menuIconTooltip!: MatTooltip;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    public authService: AuthService,
    public drawerControlService: DrawerControlService
  ) {}

  showTooltip() {
    this.menuIconTooltip.show();
  }

  hideTooltip() {
    this.menuIconTooltip.hide();
  }

  redirectToAnalytics(){
    this.router.navigate(['/analytics']);
  }

  logout(){
    this.authService.logout();
    sessionStorage.removeItem('lastConversationId');
  }
}
