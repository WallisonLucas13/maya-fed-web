import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    CommonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  viewProviders: [provideIcons({ ionMenu, ionAnalytics})],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NavbarComponent {
  @ViewChild('menuIconTooltip') menuIconTooltip!: MatTooltip;

  constructor(
    private router: Router,
    public authService: AuthService,
    public drawerControlService: DrawerControlService
  ) {}

  ngOnInit(): void {
    this.drawerControlService.menuTooltipOpened.subscribe((opened) => {
      if(opened && this.menuIconTooltip){
        this.menuIconTooltip.show();
      } else if(this.menuIconTooltip){
        this.menuIconTooltip.hide();
      }
    });
  }

  redirectToAnalytics(){
    this.router.navigate(['/analytics']);
  }

  logout(){
    this.authService.logout();
    sessionStorage.clear();
  }

  hideMenuTooltip(){
    this.drawerControlService.hideMenuTooltip();
  }
}
