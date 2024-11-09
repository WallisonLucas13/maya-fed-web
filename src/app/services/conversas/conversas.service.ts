import { Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';
import { ConversaPreview } from '../../models/preview/conversa-preview';
import {Environment} from '../../environments/environment';
import { HttpParams } from '@angular/common/http';
import { Conversa } from '../../models/conversation/conversa';
import { Mensagem } from '../../models/conversation/mensagem';
import { BehaviorSubject, Subscription } from 'rxjs';

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

  constructor() {}

  public getConversations(username: string): Promise<AxiosResponse<ConversaPreview[]>> {
    const url: string = `${this.env.server.api_url}${this.env.paths.conversas}`;
    const params = {username: username};
    return axios.get<ConversaPreview[]>(url, {params: params});
  }

  public getConversation(conversationId: string, username: string): Promise<AxiosResponse<Conversa>> {
    const url: string = `${this.env.server.api_url}${this.env.paths.conversa}`;
    const params = {conversationId: conversationId, username: username};
    return axios.get<Conversa>(url, {params: params});
  }

  public sendMessage(conversationId: string, username: string, message: string): Promise<AxiosResponse<Mensagem>> {
    const url: string = `${this.env.server.api_url}${this.env.paths.mensagem}`;
    const params = {username: username, conversationId: conversationId};
    return axios.post<Mensagem>(url, {message: message}, {params: params});
  }

  public sendMessageToNewConversation(username: string, message: string): Promise<AxiosResponse<Mensagem>> {
    const url: string = `${this.env.server.api_url}${this.env.paths.mensagem}`;
    const params = {username: username};
    return axios.post<Mensagem>(url, {message: message}, {params: params});
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
