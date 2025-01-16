import { Injectable } from '@angular/core';
import axios, { AxiosHeaders, AxiosResponse } from 'axios';
import { ConversaPreview } from '../../models/preview/conversa-preview';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Conversa } from '../../models/conversation/conversa';
import { Mensagem } from '../../models/conversation/mensagem';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { LoadingService } from '../loading/loading.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { paths } from '../../../environments/paths';

@Injectable({
  providedIn: 'root'
})
export class ConversasService {
  private updateConversationsSubject = new BehaviorSubject<void>(undefined);
  private newConversation = new BehaviorSubject<{userMessage: string, file: File | null, systemSubscription: Promise<AxiosResponse<Mensagem, any>>}>({
     userMessage: '',
     file: null,
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
    const url: string = `${environment.apiUrl}${paths.conversations}`;
    return axios.get<ConversaPreview[]>(url);
  }

  public getConversation(conversationId: string): Promise<AxiosResponse<Conversa>> {
    const url: string = `${environment.apiUrl}${paths.conversation}`;
    const params = {conversationId: conversationId};
    return axios.get<Conversa>(url, {params: params});
  }

  public sendMessage(conversationId: string, message: string): Promise<AxiosResponse<Mensagem>> {
    const url: string = `${environment.apiUrl}${paths.message}`;
    const params = {conversationId: conversationId};
    return axios.post<Mensagem>(url, {message: message}, {params: params});
  }

  public sendMessageWithFiles(conversationId: string, message: string, file: any): Promise<AxiosResponse<Mensagem>> {
    const url: string = `${environment.apiUrl}${paths.messageWithFiles}`;
    const formData = new FormData();
    formData.append('input', message);
    formData.append('files', file);

    return axios.post<Mensagem>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      params: {
        conversationId: conversationId
      }
    });
  }

  public sendMessageToNewConversation(message: string): Promise<AxiosResponse<Mensagem>> {
    const url: string = `${environment.apiUrl}${paths.message}`;
    return axios.post<Mensagem>(url, {message: message});
  }

  public sendMessageToNewConversationWithFiles(message: string, file: any): Promise<AxiosResponse<Mensagem>> {
    const url: string = `${environment.apiUrl}${paths.messageWithFiles}`;
    const formData = new FormData();
    formData.append('input', message);
    formData.append('files', file);

    return axios.post<Mensagem>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  public emitUpdateConversations(): void {
    this.updateConversationsSubject.next();
  }

  public getUpdateConversations(): BehaviorSubject<void> {
    return this.updateConversationsSubject;
  }

  public setNewConversation(userMessage: string, file: File | null, systemSubscription: Promise<AxiosResponse<Mensagem, any>>): void {
    this.newConversation.next({
      userMessage: userMessage, 
      file: file,
      systemSubscription: systemSubscription
    });
  }

  public getNewConversation(){
    return this.newConversation;
  }
}
