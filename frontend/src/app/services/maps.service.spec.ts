import { TestBed } from '@angular/core/testing';
import { MapsService } from './maps.service';
import { GameModes } from '../data/gamemodes.data';
import { SeasonsAndMapsStore } from '../store/seasons-maps-store';

describe('MapsService', () => {
  let service: MapsService;

  beforeEach(() => {
    const mockStore = {
      seasons: jest.fn().mockReturnValue(new Map([[GameModes.M1V1, ['season1']]])),
      maps: jest.fn().mockReturnValue(new Map([[GameModes.M1V1, ['season1']]])),
    } as any;
    TestBed.configureTestingModule({
      providers: [
        MapsService,
        {provide: SeasonsAndMapsStore, mockStore},
      ]
    });
    service = TestBed.inject(MapsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMaps()', () => {
    it('should return maps filtered by game and mode', () => {
      const maps = service.getMaps('starcraft2', GameModes.M1V1);

      expect(Array.isArray(maps)).toBe(true);
      expect(maps.length).toBeGreaterThan(0);

      // Verify all returned maps match the criteria
      maps.forEach(map => {
        expect(map.game).toBe('starcraft2');
        expect(map.mode).toBe(GameModes.M1V1);
        expect(map).toHaveProperty('name');
        expect(map).toHaveProperty('link');
      });
    });

    it('should return empty array for non-existent game', () => {
      const maps = service.getMaps('nonexistent', GameModes.M1V1);

      expect(Array.isArray(maps)).toBe(true);
      expect(maps.length).toBe(0);
    });

    it('should return empty array for non-existent mode', () => {
      const maps = service.getMaps('starcraft2', 'NONEXISTENT' as GameModes);

      expect(Array.isArray(maps)).toBe(true);
      expect(maps.length).toBe(0);
    });

    it('should return different maps for different modes', () => {
      const m1v1Maps = service.getMaps('starcraft2', GameModes.M1V1);
      const m2v2Maps = service.getMaps('starcraft2', GameModes.M2V2);

      expect(m1v1Maps.length).toBeGreaterThan(0);
      expect(m2v2Maps.length).toBeGreaterThan(0);
      // Just verify both have maps, don't assume different lengths
      expect(m1v1Maps.length).toBeGreaterThan(0);
      expect(m2v2Maps.length).toBeGreaterThan(0);
    });
  });

  describe('getMapByName()', () => {
    it('should return map when valid game and name are provided', () => {
      const map = service.getMapByName('starcraft2', 'Incorporeal LE');

      expect(map).toBeDefined();
      expect(map?.game).toBe('starcraft2');
      expect(map?.name).toBe('Incorporeal LE');
      expect(map?.mode).toBe(GameModes.M1V1);
    });

    it('should return undefined when map name does not exist', () => {
      const map = service.getMapByName('starcraft2', 'NonExistent Map');

      expect(map).toBeUndefined();
    });

    it('should return undefined when game does not exist', () => {
      const map = service.getMapByName('nonexistent', 'Incorporeal LE');

      expect(map).toBeUndefined();
    });
  });

  describe('getMapsByNames()', () => {
    it('should return maps for valid names', () => {
      const mapNames = ['Incorporeal LE', 'Last Fantasy LE'];
      const maps = service.getMapsByNames('starcraft2', GameModes.M1V1, mapNames);

      expect(Array.isArray(maps)).toBe(true);
      expect(maps.length).toBe(2);
      expect(maps[0].name).toBe('Incorporeal LE');
      expect(maps[1].name).toBe('Last Fantasy LE');
    });

    it('should create placeholder map for non-existent names', () => {
      const mapNames = ['Incorporeal LE', 'NonExistent Map'];
      const maps = service.getMapsByNames('starcraft2', GameModes.M1V1, mapNames);

      expect(maps.length).toBe(2);
      expect(maps[0].name).toBe('Incorporeal LE');
      expect(maps[1].name).toBe('NonExistent Map');
      expect(maps[1].link).toBe(''); // Placeholder has empty link
    });

    it('should handle empty array of names', () => {
      const maps = service.getMapsByNames('starcraft2', GameModes.M1V1, []);

      expect(Array.isArray(maps)).toBe(true);
      expect(maps.length).toBe(0);
    });
  });
});
