import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { DrawerControlService } from '../../../services/drawer/drawer-control.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { ionMenu } from '@ng-icons/ionicons';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIconComponent, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  viewProviders: [provideIcons({ ionMenu })]
})
export class RegisterComponent {
  registrationForm: FormGroup;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private toastr: ToastrService,
    public drawerControlService: DrawerControlService,
    private titleService: Title
  ){
    this.registrationForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });

    this.titleService.setTitle('Cadastro');
  }

  register(){
    const credentials = {
      username: this.registrationForm.get('username')?.value,
      password: this.registrationForm.get('password')?.value
    };

    if(!this.registrationForm.invalid){
      this.authService.register(credentials);
      return;
    };

    this.toastr.warning('Preencha todos os campos!', 'Campos inválidos', {
      timeOut: 2000,
      positionClass: 'toast-bottom-right'
    });
  }
}
