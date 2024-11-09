import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { SecurityContext } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    HttpClientModule,
    MarkdownModule.forRoot({
      sanitize: SecurityContext.HTML
    })
  ],
  exports: [MarkdownModule]
})
export class MarkdownConfigModule {}