import { TestBed } from '@angular/core/testing';

import { AuthInterceptor } from './auth.interceptor';
import { RemoteService } from './remote.service';

describe('AuthInterceptor', () => {
  let service: AuthInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: RemoteService, useValue: { getTokenAsync: () => 'trewertrewertrewerte'}}
      ]
    });
    service = TestBed.inject(AuthInterceptor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
