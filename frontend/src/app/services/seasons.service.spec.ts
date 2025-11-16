import { TestBed } from '@angular/core/testing';

import { SeasonsService } from './seasons.service';
import { SeasonsAndMapsStore } from '../store/seasons-maps-store';
import { GameModes } from '../data/gamemodes.data';
import { Season } from '../data/seasons.data';

describe('SeasonsService', () => {
  let service: SeasonsService;

  beforeEach(() => {
    const mockSeasons = new Map<GameModes, Season[]>([
      [GameModes.M1V1, [{ seasonName: 'Season 1', startDate: '2023-01-01', closingDate: '2023-12-31', maps: ['Map1'] }]],
    ]);
    const mockStore = {
      seasons: jest.fn().mockReturnValue(mockSeasons),
      maps: jest.fn().mockReturnValue([]),
      isLoading: jest.fn().mockReturnValue(false),
      loadSeasons: jest.fn().mockResolvedValue(undefined),
    };
    TestBed.configureTestingModule({
      providers: [
        SeasonsService,
      ]
    });
    TestBed.overrideProvider(SeasonsAndMapsStore, { useValue: mockStore });
    service = TestBed.inject(SeasonsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
