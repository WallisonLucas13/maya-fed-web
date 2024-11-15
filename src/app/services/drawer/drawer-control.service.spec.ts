import { TestBed } from '@angular/core/testing';

import { DrawerControlService } from './drawer-control.service';

describe('DrawerControlService', () => {
  let service: DrawerControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DrawerControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
