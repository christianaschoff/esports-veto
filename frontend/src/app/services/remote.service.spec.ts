import { TestBed } from '@angular/core/testing';

import { RemoteService } from './remote.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('RemoteService', () => {
  let service: RemoteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), 
                  provideHttpClientTesting()]
    });
    service = TestBed.inject(RemoteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
