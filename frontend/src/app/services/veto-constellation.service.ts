import { Injectable } from '@angular/core';
import { BestOf } from '../data/gamemodes.data';
import { Constellation, VETO_ACTION, VetoRound } from '../data/veto-constellation.data';


@Injectable({
  providedIn: 'root'
})
export class VetoConstellationService {

  constructor() { }
  
  calculate(cstn: Constellation): VetoRound[] {
    if(cstn.gameid === 'starcraft2') {            
      return this.calculateStarcraft2(cstn);
    }
    return [];
  }

  calculateStarcraft2(cstn: Constellation): VetoRound[] {  
    const laddermaps = cstn.maps.length;
    const vetos = laddermaps - (this.getMapsNumber(cstn.bestOf))
    const returnList: VetoRound[] = [];
    
    if(cstn.vetoSystem === "ABAB") {
      for(let i = 1; i <= laddermaps; i++) {        
          returnList.push(
            { step: i,
              actionType: vetos >= i ? VETO_ACTION.VETO : VETO_ACTION.PICK, 
              playerName: (i%2 != 0 ? cstn.playerA : cstn.playerB )
            });
      }
    }

    if(cstn.vetoSystem === "ABBA") {
      const pn = ((i: number):string => {
        if (i == 1 || i == 4) {
          return cstn.playerA;
        }
        if(i == 2 || i == 3) {
          return cstn.playerB;
        }
        return i%2 == 0 ? cstn.playerA : cstn.playerB;
      });

      for(let i = 1; i <= laddermaps; i++) {          
          returnList.push(
            { step: i,
              actionType: vetos >= i ? VETO_ACTION.VETO : VETO_ACTION.PICK, 
              playerName: pn(i)
            });
      }
    }

    return returnList;
  }

  getMapsNumber(bestof: BestOf) {
    switch(bestof) {
      case BestOf.BO1: return 1;
      case BestOf.BO3: return 3;
      case BestOf.BO5: return 5;
      case BestOf.BO7: return 7;
      case BestOf.BO9: return 9;
      case BestOf.UNSET:
      case BestOf.FREE: return 0;
    }
  }
}
