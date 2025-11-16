import { inject, Injectable } from '@angular/core';
import { Maps } from '../data/maps.data';
import { GameModes } from '../data/gamemodes.data';
import { SeasonsAndMapsStore } from '../store/seasons-maps-store';
import { Season } from '../data/seasons.data';

@Injectable({
  providedIn: 'root'
})
export class MapsService {

  seasonMapsState = inject(SeasonsAndMapsStore);

  constructor() {   }

  public getMaps(game: string, mode: GameModes, season?: string): Maps[] {
    const seasons = this.seasonMapsState.seasons().get(mode);
    if(!seasons) {
      return [];
    }

    let pinpointSeason: Season | undefined;
    if(season) {
      pinpointSeason = seasons?.filter(x => x.seasonName === season)[0];
    }
    if(!pinpointSeason) {
      pinpointSeason = seasons[0];
    }
    return this.getMapsByNames(game, mode, pinpointSeason.maps);
  }

  public getMapByName(game: string, name: string): Maps | undefined {
    const result = this.seasonMapsState.maps().filter(x => x.game === game && x.name === name);
    return result ? result[0] : undefined;
  }

  public getMapsByNames(game: string, mode: GameModes, mapNames: string[]): Maps[] {
    const allMaps = this.seasonMapsState.maps().filter(x => x.game === game && x.mode === mode);    
    const result: Maps[] = [];
    mapNames.forEach((name) => {
        var globalMaps = allMaps.filter(map => map.name === name);
        if(globalMaps && globalMaps.length > 0) {
          result.push(globalMaps[0]);          
        } else {          
          result.push({game, mode, name, link: ''});
        }
    });
    return result;
  }
}
