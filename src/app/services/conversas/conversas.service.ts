import { Injectable } from '@angular/core';
import axios, { AxiosHeaders, AxiosResponse } from 'axios';
import { ConversaPreview } from '../../models/preview/conversa-preview';
import {Environment} from '../../environments/environment';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Conversa } from '../../models/conversation/conversa';
import { Mensagem } from '../../models/conversation/mensagem';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { LoadingService } from '../loading/loading.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ConversasService {
  private env: Environment = new Environment();
  private updateConversationsSubject = new BehaviorSubject<void>(undefined);
  private newConversation = new BehaviorSubject<{userMessage: string, systemSubscription: Promise<AxiosResponse<Mensagem, any>>}>({
     userMessage: '', 
     systemSubscription: Promise.resolve({} as AxiosResponse<Mensagem, any>) 
  });

  constructor(
    private authService: AuthService, 
    private router: Router,
    private loadingService: LoadingService,
    private toastr: ToastrService
  ) {

    this.authService.token.subscribe((token) => {
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        this.updateConversationsSubject.next();
      } else {
        axios.defaults.headers.common['Authorization'] = null;
        this.updateConversationsSubject.next();
        this.router.navigate(['/login']);
      }
    });

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 403) {
          this.authService.logout();
          this.router.navigate(['/login']);
          this.loadingService.hide();

          this.toastr.error(error.response.data, 'Acesso Negado!', {
            timeOut: 2000,
            positionClass: 'toast-bottom-right'
          });
        }
        return Promise.reject(error);
      }
    );
  }

  public getConversations(): Promise<AxiosResponse<ConversaPreview[]>> {
    const url: string = `${this.env.server.api_url}${this.env.paths.conversas}`;
    return axios.get<ConversaPreview[]>(url);
  }

  public getConversation(conversationId: string): Promise<AxiosResponse<Conversa>> {
    const url: string = `${this.env.server.api_url}${this.env.paths.conversa}`;
    const params = {conversationId: conversationId};
    return axios.get<Conversa>(url, {params: params});
  }

  public sendMessage(conversationId: string, message: string): Promise<AxiosResponse<Mensagem>> {
    const url: string = `${this.env.server.api_url}${this.env.paths.mensagem}`;
    const params = {conversationId: conversationId};
    return axios.post<Mensagem>(url, {message: message}, {params: params});
  }

  public sendMessageToNewConversation(message: string): Promise<AxiosResponse<Mensagem>> {
    const url: string = `${this.env.server.api_url}${this.env.paths.mensagem}`;
    return axios.post<Mensagem>(url, {message: message});
  }

  public emitUpdateConversations(): void {
    this.updateConversationsSubject.next();
  }

  public getUpdateConversations(): BehaviorSubject<void> {
    return this.updateConversationsSubject;
  }

  public setNewConversation(userMessage: string, systemSubscription: Promise<AxiosResponse<Mensagem, any>>): void {
    this.newConversation.next({userMessage: userMessage, systemSubscription: systemSubscription});
  }

  public getNewConversation(){
    return this.newConversation;
  }
}
