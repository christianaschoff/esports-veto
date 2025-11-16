import { inject, Injectable } from '@angular/core';
import { SeasonsAndMapsStore } from '../store/seasons-maps-store';
import { GameModes } from '../data/gamemodes.data';

@Injectable({
  providedIn: 'root'
})
export class SeasonsService {

  seasonAndMapsState = inject(SeasonsAndMapsStore);

  constructor() { }

  seasonList(game: string, gameMode: GameModes) {
      return this.seasonAndMapsState.seasons().get(gameMode);
  }

}
