import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { SessionManagementService } from './session.service';

describe('SessionManagementService', () => {
  let service: SessionManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionManagementService, provideHttpClient()]
    });
    service = TestBed.inject(SessionManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should have a default session', () => {
    expect(service).toBeTruthy();
  });

});
