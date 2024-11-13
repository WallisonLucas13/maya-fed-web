import { Component, ElementRef, EventEmitter, Inject, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Credentials } from '../../../models/auth/user.credentials';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    FormsModule, 
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  credencialsForm: FormGroup;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private toastr: ToastrService
  ) {
    this.credencialsForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
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
      positionClass: 'toast-bottom-right'
    });
  }

  redirectToRegister(){
    this.router.navigate(['/register']);
  }
}
