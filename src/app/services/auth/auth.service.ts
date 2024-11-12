import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import axios from 'axios';
import { Credentials } from '../../models/auth/user.credentials';
import { BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { paths } from '../../../environments/paths';
import { LoadingService } from '../../services/loading/loading.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  token = new BehaviorSubject<string>('');
  username = new BehaviorSubject<string>('');

  constructor(
    private router: Router, 
    private toastr: ToastrService,
    private loadingService: LoadingService
  ) {
    this.recoverTokenFromSession();
  }

  register(credentials: Credentials){
    const url: string = `${environment.apiUrl}${paths.register}`;
    this.loadingService.show();

    axios.post(url, credentials)
     .then((response) => {
        this.isAuthenticated = true;
        this.token.next(response.data.token);
        this.username.next(credentials.username);

        this.toastr.success('Conta criada com sucesso!', `Seja bem vindo ${credentials.username}!`, {
          timeOut: 3000,
          positionClass: 'toast-bottom-center'
        });
        
        setTimeout(() => {
          this.redirectAfterLogin();
          this.loadingService.hide();
        }, 400)
      })
      .catch(error => {
        if(error.response.status === 400){
          this.toastr.error(error.response.data, '', {
            timeOut: 2000,
            positionClass: 'toast-bottom-right'
          });
          this.isAuthenticated = false;
          this.loadingService.hide();
          return;
        }
      })
  }

  login(credentials: Credentials){
    const url: string = `${environment.apiUrl}${paths.login}`;
    this.loadingService.show();

    axios.post(url, credentials)
     .then((response) => {
        this.isAuthenticated = true;
        this.token.next(response.data.token);
        this.username.next(credentials.username);

        this.toastr.success('Login efetuado com sucesso!', `Seja bem vindo ${credentials.username}!`, {
          timeOut: 3000
        });
        
        setTimeout(() => {
          this.redirectAfterLogin();
          this.loadingService.hide();
        }, 400)
      })
      .catch(error => {
        if(error.response.status === 401){
          this.toastr.error(error.response.data, '', {
            timeOut: 2000,
            positionClass: 'toast-bottom-right'
          });
        }
        this.isAuthenticated = false;
        this.loadingService.hide();
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
