import { Injectable } from '@angular/core';
import { Maps } from '../data/maps.data';
import { GameModes } from '../data/gamemodes.data';

@Injectable({
  providedIn: 'root'
})
export class MapsService {

  private maps: Maps[] = [];

  constructor() { 

    this.maps = [
      {
        game: 'starcraft2',
        mode: GameModes.M1V1,
        name: 'Incorporeal LE',
        link: 'https://liquipedia.net/starcraft2/Incorporeal_LE',
        image:'maps/starcraft2/1v1/incorporeal.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M1V1,
        name: 'Last Fantasy LE',
        link: 'https://liquipedia.net/starcraft2/Last_Fantasy_LE',
        image:'maps/starcraft2/1v1/last_fantasy.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M1V1,
        name: 'Ley Lines',
        link: 'https://liquipedia.net/starcraft2/Ley_Lines',
        image:'maps/starcraft2/1v1/ley_lines.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M1V1,
        name: 'Magannatha LE',
        link: 'https://liquipedia.net/starcraft2/Magannatha_LE',
        image:'maps/starcraft2/1v1/magannatha.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M1V1,
        name: 'Persephone',
        link: 'https://liquipedia.net/starcraft2/Persephone',
        image:'maps/starcraft2/1v1/persephone.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M1V1,
        name: 'Pylon LE',
        link: 'https://liquipedia.net/starcraft2/Pylon_LE',
        image:'maps/starcraft2/1v1/pylon.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M1V1,
        name: 'Tokamak',
        link: 'https://liquipedia.net/starcraft2/Tokamak',
        image:'maps/starcraft2/1v1/tokamak.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M1V1,
        name: 'Torches',
        link: 'https://liquipedia.net/starcraft2/Torches',
        image:'maps/starcraft2/1v1/torches.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M1V1,
        name: 'Ultralove',
        link: 'https://liquipedia.net/starcraft2/Ultralove',
        image:'maps/starcraft2/1v1/ultralove.jpg'
      },
      
      {
        game: 'starcraft2',
        mode: GameModes.M2V2,
        name: 'Arctic Flowers LE',
        link: 'https://liquipedia.net/starcraft2/Arctic_Flowers_LE',
        image:'maps/starcraft2/2v2/arctic_flowers.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M2V2,
        name: 'Breakwater LE',
        link: 'https://liquipedia.net/starcraft2/Breakwater_LE',
        image:'maps/starcraft2/2v2/breakwater.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M2V2,
        name: 'Crimson Research Lab LE',
        link: 'https://liquipedia.net/starcraft2/Crimson_Research_Lab_LE',
        image:'maps/starcraft2/2v2/crimson_research_lab.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M2V2,
        name: 'Emerald City CE',
        link: 'https://liquipedia.net/starcraft2/Emerald City_CE',
        image:'maps/starcraft2/2v2/emerald_city.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M2V2,
        name: 'Reclamation LE',
        link: 'https://liquipedia.net/starcraft2/Reclamation_LE',
        image:'maps/starcraft2/2v2/reclamation.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M2V2,
        name: 'Rhoskallian LE',
        link: 'https://liquipedia.net/starcraft2/Rhoskallian_LE',
        image:'maps/starcraft2/2v2/rhoskallian.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M2V2,
        name: 'Rohana LE',
        link: 'https://liquipedia.net/starcraft2/Rohana_LE',
        image:'maps/starcraft2/2v2/rohana.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M2V2,
        name: 'Undercurrent LE',
        link: 'https://liquipedia.net/starcraft2/Undercurrent_LE',
        image:'maps/starcraft2/2v2/undercurrent.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M2V2,
        name: 'Yellowjacket',
        link: 'https://liquipedia.net/starcraft2/Yellowjacket',
        image:'maps/starcraft2/2v2/yellowjacket.jpg'
      },

      {
        game: 'starcraft2',
        mode: GameModes.M3V3,
        name: 'Arkadia',
        link: 'https://liquipedia.net/starcraft2/Arkadia',
        image:'maps/starcraft2/3v3/arkadia.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M3V3,
        name: 'Desolator',
        link: 'https://liquipedia.net/starcraft2/Desolator',
        image:'maps/starcraft2/3v3/desolator.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M3V3,
        name: 'Lost July',
        link: 'https://liquipedia.net/starcraft2/Lost_July',
        image:'maps/starcraft2/3v3/lost_july.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M3V3,
        name: 'Megastructure',
        link: 'https://liquipedia.net/starcraft2/Megastructure',
        image:'maps/starcraft2/3v3/megastructure.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M3V3,
        name: 'Rosebud LE',
        link: 'https://liquipedia.net/starcraft2/Rosebud_LE',
        image:'maps/starcraft2/3v3/rosebud.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M3V3,
        name: 'Sandstorm CE',
        link: 'https://liquipedia.net/starcraft2/Sandstorm_CE',
        image:'maps/starcraft2/3v3/sandstorm.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M3V3,
        name: 'Sentinel CE',
        link: 'https://liquipedia.net/starcraft2/Sentinel_CE',
        image:'maps/starcraft2/3v3/sentinel.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M3V3,
        name: 'Voracity',
        link: 'https://liquipedia.net/starcraft2/Voracity',
        image:'maps/starcraft2/3v3/voracity.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M3V3,
        name: 'White Chamber',
        link: 'https://liquipedia.net/starcraft2/White_Chamber',
        image:'maps/starcraft2/3v3/white_chamber.jpg'
      },

      {
        game: 'starcraft2',
        mode: GameModes.M4V4,
        name: 'Ashen Cradle',
        link: 'https://liquipedia.net/starcraft2/Ashen_Cradle',
        image:'maps/starcraft2/4v4/ashen_cradle.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M4V4,
        name: 'Concord LE',
        link: 'https://liquipedia.net/starcraft2/Concord_LE',
        image:'maps/starcraft2/4v4/concord.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M4V4,
        name: 'Dystopian Complex',
        link: 'https://liquipedia.net/starcraft2/Dystopian_Complex',
        image:'maps/starcraft2/4v4/dystopian_complex.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M4V4,
        name: 'Floodplain',
        link: 'https://liquipedia.net/starcraft2/Floodplain',
        image:'maps/starcraft2/4v4/floodplain.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M4V4,
        name: 'Morheimen',
        link: 'https://liquipedia.net/starcraft2/Morheimen',
        image:'maps/starcraft2/4v4/morheimen.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M4V4,
        name: 'Riptide',
        link: 'https://liquipedia.net/starcraft2/Riptide',
        image:'maps/starcraft2/4v4/riptide.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M4V4,
        name: 'Slowdive',
        link: 'https://liquipedia.net/starcraft2/Slowdive',
        image:'maps/starcraft2/4v4/slowdive.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M4V4,
        name: 'Tunguska',
        link: 'https://liquipedia.net/starcraft2/Tunguska',
        image:'maps/starcraft2/4v4/tunguska.jpg'
      },
      {
        game: 'starcraft2',
        mode: GameModes.M4V4,
        name: 'Tuonela LE',
        link: 'https://liquipedia.net/starcraft2/Tuonela_LE',
        image:'maps/starcraft2/4v4/tuonela.jpg'
      },
  ];
  }

  public getMaps(game: string, mode: GameModes): Maps[] {    
    return this.maps.filter(x => x.game === game && x.mode === mode);
  }

  public getMapByName(game: string, name: string): Maps | undefined {    
    const result = this.maps.filter(x => x.game === game && x.name === name);
    return result ? result[0] : undefined;
  }

  public getMapsByNames(game: string, mode: GameModes, mapNames: string[]): Maps[] {
    const allMaps = this.maps.filter(x => x.game === game && x.mode === mode); 
    const result: Maps[] = [];
    mapNames.forEach((name) => {
        var globlaMaps = allMaps.filter(map => map.name === name);
        if(globlaMaps) {
          result.push(globlaMaps[0]);
        } else {
          result.push({game, mode, name, link: ''});
        }
    });  
    return result;
  }
}
