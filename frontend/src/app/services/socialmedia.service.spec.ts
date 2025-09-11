import { TestBed } from '@angular/core/testing';
import { SocialmediaService } from './socialmedia.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('SocialmediaService', () => {
  let service: SocialmediaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), 
                  provideHttpClientTesting()]
    });
    service = TestBed.inject(SocialmediaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
