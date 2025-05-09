import { Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Credentials } from '../../../models/auth/user.credentials';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { MatIconModule } from '@angular/material/icon';
import { DrawerControlService } from '../../../services/drawer/drawer-control.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { ionMenu } from '@ng-icons/ionicons';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    FormsModule, 
    ReactiveFormsModule,
    CommonModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  viewProviders: [provideIcons({ ionMenu })],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginComponent {
  credencialsForm: FormGroup;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private toastr: ToastrService,
    public drawerControlService: DrawerControlService,
    private titleService: Title
  ) {
    this.credencialsForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });

    this.titleService.setTitle('Login');
    this.activeDrawerInAndroid();
  }

  login() {
    const credencials: Credentials = {
      username: this.credencialsForm.get('username')?.value,
      password: this.credencialsForm.get('password')?.value
    };

    if(!this.credencialsForm.invalid){
      this.authService.login(credencials);
      return;
    };

    this.toastr.warning('Preencha todos os campos!', 'Campos inválidos', {
      timeOut: 2000,
      positionClass: 'toast-top-right'
    });
  }

  redirectToRegister(){
    this.router.navigate(['/register']);
  }

  activeDrawerInAndroid(){
    if(this.drawerControlService.isAndroid.getValue()){
      this.drawerControlService.drawerOpened.next(true);
    }
  }
}
