import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardConversaPreviewComponent } from './card-conversa-preview.component';

describe('CardConversaPreviewComponent', () => {
  let component: CardConversaPreviewComponent;
  let fixture: ComponentFixture<CardConversaPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardConversaPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardConversaPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
