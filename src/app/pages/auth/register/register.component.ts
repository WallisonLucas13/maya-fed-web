import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registrationForm: FormGroup;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private toastr: ToastrService
  ){
    this.registrationForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
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

    this.toastr.error('Preencha todos os campos!', 'Campos inválidos', {
      timeOut: 2000,
      positionClass: 'toast-bottom-right'
    });
  }
}
