import { TestBed } from '@angular/core/testing';
import { SignalrService } from './signalr.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Signalr', () => {
  let service: SignalrService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), 
                  provideHttpClientTesting()]
    });
    service = TestBed.inject(SignalrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
