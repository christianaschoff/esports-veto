import { Injectable } from '@angular/core';
import { BestOf, GameModes } from '../data/gamemodes.data';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {

  constructor() { }
  getGamemodeTextFromString(gamemode: string, lang: string ='en-en'): string { 
    return this.getGamemodeText(gamemode as GameModes, lang);
  }

  getGamemodeText(gamemode: GameModes, lang: string ='en-en'): string {
    switch (gamemode) {
      case GameModes.M1V1 : return '1v1';
      case GameModes.M2V2 : return '2v2';
      case GameModes.M3V3 : return '3v3';
      case GameModes.M4V4 : return '4v4';
      case GameModes.M5V5 : return '5v5';
      default: 
      return `unknown ${gamemode}`
    }
  }

getBestofTextFromString(bestof: string, lang: string ='en-en'): string { 
    return this.getBestofText(bestof as BestOf, lang);
  }

  getBestofText(bestOf: BestOf, lang: string ='en-en'): string {
    switch (bestOf) {
      case BestOf.BO1 : return 'Best of 1';
      case BestOf.BO3 : return 'Best of 3';
      case BestOf.BO5 : return 'Best of 5';
      case BestOf.BO7 : return 'Best of 7';
      case BestOf.FREE : return 'user set';
      default: 
      return `unknown ${bestOf}`
    }
  }

}
