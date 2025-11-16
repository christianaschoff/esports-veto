import { TestBed } from '@angular/core/testing';

import { SeasonsService } from './seasons.service';
import { SeasonsAndMapsStore } from '../store/seasons-maps-store';
import { GameModes } from '../data/gamemodes.data';

describe('SeasonsService', () => {
  let service: SeasonsService;

  beforeEach(() => {
    const mockStore = {
      seasons: jest.fn().mockReturnValue(new Map([[GameModes.M1V1, ['season1']]]))
    } as any;
    TestBed.configureTestingModule({
      providers: [
        SeasonsService,
        { provide: SeasonsAndMapsStore, useValue: mockStore }
      ]
    });
    service = TestBed.inject(SeasonsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
