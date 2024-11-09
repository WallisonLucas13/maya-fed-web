import { TestBed } from '@angular/core/testing';

import { ConversasService } from './conversas.service';

describe('ConversasService', () => {
  let service: ConversasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConversasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
