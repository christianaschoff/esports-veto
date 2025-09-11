import { TestBed } from '@angular/core/testing';
import { GamesService } from './games.service';
import { GameData } from '../data/game-data.data';
import { GameModes, BestOf } from '../data/gamemodes.data';

describe('GamesService', () => {
  let service: GamesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GamesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getData()', () => {
    it('should return an array of GameData', () => {
      const games = service.getData();

      expect(Array.isArray(games)).toBe(true);
      expect(games.length).toBeGreaterThan(0);
      expect(games[0]).toHaveProperty('id');
      expect(games[0]).toHaveProperty('name');
      expect(games[0]).toHaveProperty('gameModes');
      expect(games[0]).toHaveProperty('bestOf');
      expect(games[0]).toHaveProperty('isActive');
    });

    it('should return games with correct structure', () => {
      const games = service.getData();

      games.forEach(game => {
        expect(typeof game.id).toBe('string');
        expect(typeof game.name).toBe('string');
        expect(typeof game.description).toBe('string');
        expect(Array.isArray(game.gameModes)).toBe(true);
        expect(Array.isArray(game.bestOf)).toBe(true);
        expect(typeof game.isActive).toBe('boolean');
      });
    });

    it('should include StarCraft II game data', () => {
      const games = service.getData();
      const sc2Game = games.find(game => game.id === 'starcraft2');

      expect(sc2Game).toBeDefined();
      expect(sc2Game?.name).toBe('StarCraft II');
      expect(sc2Game?.gameModes).toContain(GameModes.M1V1);
      expect(sc2Game?.bestOf).toContain(BestOf.BO3);
      expect(sc2Game?.isActive).toBe(true);
    });

    it('should include Stormgate game data', () => {
      const games = service.getData();
      const stormgateGame = games.find(game => game.id === 'stormgate');

      expect(stormgateGame).toBeDefined();
      expect(stormgateGame?.name).toBe('Stormgate');
      expect(stormgateGame?.isActive).toBe(false);
    });
  });

  describe('getDataById()', () => {
    it('should return a signal with game data when valid ID is provided', () => {
      const gameSignal = service.getDataById('starcraft2');

      expect(gameSignal).toBeDefined();
      expect(typeof gameSignal).toBe('function'); // Signal is a function

      const gameData = gameSignal();
      expect(gameData).toBeDefined();
      expect(gameData?.id).toBe('starcraft2');
      expect(gameData?.name).toBe('StarCraft II');
    });

    it('should return a signal with null when invalid ID is provided', () => {
      const gameSignal = service.getDataById('nonexistent');

      expect(gameSignal).toBeDefined();
      const gameData = gameSignal();
      expect(gameData).toBeNull();
    });

    it('should return a signal with null when no ID is provided', () => {
      const gameSignal = service.getDataById();

      expect(gameSignal).toBeDefined();
      const gameData = gameSignal();
      expect(gameData).toBeNull();
    });

    it('should return a signal with null when empty string is provided', () => {
      const gameSignal = service.getDataById('');

      expect(gameSignal).toBeDefined();
      const gameData = gameSignal();
      expect(gameData).toBeNull();
    });
  });
});
