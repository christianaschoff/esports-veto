import { TestBed } from '@angular/core/testing';

import { RemoteService } from './remote.service';

describe('RemoteService', () => {
  let service: RemoteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { 
          provide: RemoteService, 
          useValue: { 
            versionInfo: jest.fn(),
            getVetoById: jest.fn(),
            createVetoSession: jest.fn(),
            joinVetoHub: jest.fn(),
            updateVeto: jest.fn()
          }
        }
      ]
    });
    service = TestBed.inject(RemoteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
