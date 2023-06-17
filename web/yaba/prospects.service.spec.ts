import { TestBed } from '@angular/core/testing';

import { ProspectsService } from './prospects.service';

describe('ProspectsService', () => {
  let service: ProspectsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProspectsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
