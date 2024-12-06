import { ChangeDetectionStrategy, Component, ViewChild, ElementRef} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HomeContainerComponent } from "./pages/home-container/home-container.component";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { LoadingService } from './services/loading/loading.service';
import { MarkdownConfigModule } from './configs/markdown-config.module';
import { ConversasService } from './services/conversas/conversas.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatSidenavModule, 
    HomeContainerComponent, 
    MatProgressSpinnerModule, 
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'mayaAI-fed-web';
  isGlobalLoading: boolean = false;

  constructor(
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.loadingService.isLoading$.subscribe(isLoading => {
      this.isGlobalLoading = isLoading;
    });
  }
}
