import { TestBed } from '@angular/core/testing';
import { SignalrService } from './signalr.service';

describe('Signalr', () => {
  let service: SignalrService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { 
          provide: SignalrService, 
          useValue: {
            hubConnection: {
              start: jest.fn(),
              stop: jest.fn(),
              invoke: jest.fn(),
              on: jest.fn()
            },
            joinVetoHub: jest.fn(),
            updateVeto: jest.fn(),
            leave: jest.fn()
          }
        }
      ]
    });
    service = TestBed.inject(SignalrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
