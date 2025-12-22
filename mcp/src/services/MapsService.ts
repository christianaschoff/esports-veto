import { Season } from '../types/index.js';

export class MapsService {
  private static readonly cache = new Map<string, { data: Season[], expiry: number }>();
  private static readonly TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private static baseUrl: string;

  static setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  static async getMapsForMode(mode: string, seasonOrDate?: string): Promise<string[]> {
    const normalizedMode = mode.slice(1).toLowerCase(); // M1V1 -> 1v1
    const url = `${this.baseUrl}/maps/starcraft2/starcraft2.${normalizedMode}.seasons-to-maps.json`;

    let seasons: Season[];

    // Check cache
    const cached = this.cache.get(mode);
    if (cached && cached.expiry > Date.now()) {
      seasons = cached.data;
    } else {
      // Fetch from API
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch maps: ${response.status} ${response.statusText}`);
        }
        seasons = await response.json() as Season[];
        // Cache with TTL
        this.cache.set(mode, { data: seasons, expiry: Date.now() + this.TTL });
      } catch (error) {
        throw new Error(`Error fetching maps for mode ${mode}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Find matching season
    let targetSeason: Season | undefined;

    if (seasonOrDate) {
      const parsedDate = new Date(seasonOrDate);
      const isDate = !isNaN(parsedDate.getTime());

      if (isDate) {
        // Find season by date
        targetSeason = seasons.find(season => {
          const start = new Date(season.startDate);
          const end = new Date(season.closingDate);
          return start <= parsedDate && parsedDate <= end;
        });
      } else {
        // Find by season name
        targetSeason = seasons.find(season => season.seasonName === seasonOrDate);
      }

      if (!targetSeason) {
        throw new Error(`No matching season found for ${isDate ? 'date' : 'name'}: ${seasonOrDate}`);
      }
    } else {
      // Get latest season (most recent closing date)
      targetSeason = seasons.sort((a, b) => new Date(b.closingDate).getTime() - new Date(a.closingDate).getTime())[0];
      if (!targetSeason) {
        throw new Error(`No seasons available for mode: ${mode}`);
      }
    }

    return targetSeason.maps;
  }
}