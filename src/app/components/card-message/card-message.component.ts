import { Component, ElementRef, Inject, Input, Renderer2, SecurityContext, ViewChild } from '@angular/core';
import { Mensagem } from '../../models/conversation/mensagem';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MarkdownConfigModule } from '../../configs/markdown-config.module';
import hljs from 'highlight.js';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DrawerControlService } from '../../services/drawer/drawer-control.service';

@Component({
  selector: 'app-card-message',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MarkdownConfigModule,
    MatTooltipModule
  ],
  templateUrl: './card-message.component.html',
  styleUrl: './card-message.component.css',
})
export class CardMessageComponent {
  @ViewChild('cardMessage') cardMessage?: ElementRef;
  @Input() message?: Mensagem;

  constructor(
    private renderer: Renderer2,
    public drawerControlService: DrawerControlService
  ) { }

  ngAfterViewInit() {
    setTimeout(() => {
      this.applyStyles();
    }, 200)
  }

  applyStyles() {
    if (this.cardMessage) {
      const nativeElement = (this.cardMessage as any).element.nativeElement
      this.applyStylesRecursively(nativeElement as HTMLElement);
    }
  }

  applyStylesRecursively(element: HTMLElement) {
    const childNodes = element.childNodes;
    childNodes.forEach((node: ChildNode) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.tagName === 'PRE') {
          this.applyPreStyles(el);
        }
        this.applyStylesRecursively(el);
      }
    });
  }

  applyPreStyles(preElement: HTMLElement) {
    this.renderer.setStyle(preElement, 'word-wrap', 'break-word');
    this.renderer.setStyle(preElement, 'word-break', 'break-word');
    this.renderer.setStyle(preElement, 'overflow-wrap', 'break-word');
    this.renderer.setStyle(preElement, 'max-width', '95%');

    const codeElements = preElement.querySelectorAll('code');
    codeElements.forEach((codeElement: HTMLElement) => {
      this.applyCopyButton(preElement, codeElement);

      this.renderer.setStyle(codeElement, 'word-wrap', 'break-word');
      this.renderer.setStyle(codeElement, 'word-break', 'break-word');
      this.renderer.setStyle(codeElement, 'overflow-wrap', 'break-word');
      this.renderer.setStyle(codeElement, 'max-width', '95%');
      hljs.highlightElement(codeElement);
    });
  }

  applyCopyButton(preElement: HTMLElement, codeElement: HTMLElement){
    const copyContainer = this.renderer.createElement('div');
    this.renderer.addClass(copyContainer, 'copy-container');

    this.applyCopyIconToContent(copyContainer, codeElement, preElement)
    this.renderer.appendChild(preElement, copyContainer);
  }

  applyCopyIconToContent(container: HTMLElement, codeElement: HTMLElement, preElement: HTMLElement){
    const copyIcon = this.renderer.createElement('mat-icon');
    this.renderer.addClass(copyIcon, 'copy-icon');
    this.renderer.setAttribute(copyIcon, 'role', 'img');
    this.renderer.setAttribute(copyIcon, 'class', 'mat-icon notranslate material-icons mat-ligature-font mat-icon-no-color');
    this.renderer.setAttribute(copyIcon, 'aria-hidden', 'true');
    this.renderer.setAttribute(copyIcon, 'aria-disabled', 'false');
    this.renderer.setAttribute(copyIcon, 'matTooltip', 'Copiar');
    this.renderer.setAttribute(copyIcon, 'ng-reflect-message', 'Copiar');
    
    const iconText = this.renderer.createText('content_copy');
    this.renderer.appendChild(copyIcon, iconText);
    this.renderer.listen(copyIcon, 'click', () => this.copyToClipboard(container, copyIcon, codeElement));
    this.renderer.appendChild(container, copyIcon);
  }

  copyToClipboard(content: HTMLElement, copyIcon: HTMLElement, codeElement: HTMLElement): void {
    const text = codeElement.innerText;
    navigator.clipboard.writeText(text).then(() => {
      console.log('Código copiado para a área de transferência!');
      this.showCopiedMessage(content, copyIcon);
    }).catch(err => {
      console.error('Erro ao copiar o código: ', err);
    });
  }

  showCopiedMessage(content: HTMLElement, copyIcon: HTMLElement): void {
    const copiedMessage = this.renderer.createElement('span');
    const messageText = this.renderer.createText('copiado!');
    this.renderer.appendChild(copiedMessage, messageText);
    content.removeChild(copyIcon);
    this.renderer.appendChild(content, copiedMessage);

    setTimeout(() => {
      content.removeChild(copiedMessage);
      this.renderer.appendChild(content, copyIcon);
    }, 2000);
  }
}
