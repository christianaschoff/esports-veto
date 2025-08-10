import { Injectable, signal, Signal } from '@angular/core';
import { GameData } from '../data/game-data.data';
import { BestOf, GameModes } from '../data/gamemodes.data';

@Injectable({
  providedIn: 'root'
})
export class GamesService {

  constructor() { }

  getData() : Array<GameData> {    
    // https://blz-contentstack-images.akamaized.net/v3/assets/blt0e00eb71333df64e/bltda1593cf3f8a2cab/6621cf091325716a8e5616ce/game_features_f2p.webp
   return [
    { name: 'StarCraft II', 
      description: 'StarCraft II Veto for competative games', 
      id: 'starcraft2', 
      image: '/images/extern/sc2.png',
      gameModes: [GameModes.M1V1, GameModes.M2V2, GameModes.M3V3, GameModes.M4V4],
      bestOf: [BestOf.BO1, BestOf.BO3, BestOf.BO5, BestOf.BO7, BestOf.BO9],
      isActive: true
    },
    { name: 'Stormgate', 
      description: 'Stormgate Veto for competative games', 
      id: 'stormgate', 
      image: '/images/extern/stormgate.webp',
      gameModes: [GameModes.M1V1, GameModes.M3V3],
      bestOf: [BestOf.BO1, BestOf.BO3, BestOf.BO5, BestOf.BO7],
      isActive: false
    },
    { name: 'Counter Strike 2', 
      description: 'Competative Games for Counter Strike 2', 
      id: 'counterstrike2', 
      image: '/images/extern/cs2.jpeg',
      gameModes: [GameModes.M2V2, GameModes.M3V3, GameModes.M4V4],
      bestOf: [BestOf.BO1, BestOf.BO3],
      isActive: false
    }
    ];
  }

  getDataById(id?: string): Signal<GameData | null> {
    var foundData = id ? this.getData().filter(x => x.id === id) : undefined;
    return signal(foundData && foundData.length > 0 ? foundData[0] : null);
  }

}
