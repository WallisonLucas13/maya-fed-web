import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import axios from 'axios';
import { Credentials } from '../../models/auth/user.credentials';
import { BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { paths } from '../../../environments/paths';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  token = new BehaviorSubject<string>('');
  username = new BehaviorSubject<string>('');

  constructor(private router: Router, private toastr: ToastrService) {
    this.recoverTokenFromSession();
  }

  register(credentials: Credentials){
    const url: string = `${environment.apiUrl}${paths.register}`;
    axios.post(url, credentials)
     .then((response) => {
        this.isAuthenticated = true;
        this.token.next(response.data.token);
        this.username.next(credentials.username);

        this.toastr.success('Conta criada com sucesso!', `Seja bem vindo ${credentials.username}!`, {
          timeOut: 2000,
          positionClass: 'toast-bottom-center'
        });
        
        setTimeout(() => {
          this.redirectAfterLogin();
        }, 500)
      })
      .catch(error => {
        if(error.response.status === 400){
          this.toastr.error(error.response.data, 'Dados Inválidos!', {
            timeOut: 2000,
            positionClass: 'toast-bottom-right'
          });
          this.isAuthenticated = false;
          return;
        }
      })
  }

  login(credentials: Credentials){
    const url: string = `${environment.apiUrl}${paths.login}`;

    axios.post(url, credentials)
     .then((response) => {
        this.isAuthenticated = true;
        this.token.next(response.data.token);
        this.username.next(credentials.username);

        this.toastr.success('Login efetuado com sucesso!', `Seja bem vindo ${credentials.username}!`);
        
        setTimeout(() => {this.redirectAfterLogin()}, 500)
      })
      .catch(error => {
        if(error.response.status === 401){
          this.toastr.error(error.response.data, 'Credenciais Inválidas!', {
            timeOut: 2000,
            positionClass: 'toast-bottom-right'
          });
        }

        this.isAuthenticated = false;
      })
  }

  logout(): void {
    this.isAuthenticated = false;
    this.token.next('');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  recoverTokenFromSession(){
    const token = sessionStorage.getItem('token');
    const username = sessionStorage.getItem('username');

    if(token && username){
      this.token.next(token);
      this.username.next(username)
      this.isAuthenticated = true;
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('username');
    }
  }

  redirectAfterLogin(){
    const lastConversationId = sessionStorage.getItem('lastConversationId');
    if(lastConversationId && lastConversationId !== ''){
      this.router.navigate(['/conversation', lastConversationId]);
      return;
    }

    this.router.navigate(['/conversation']);
  }
}
