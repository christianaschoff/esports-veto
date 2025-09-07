import { Component, computed, inject } from '@angular/core';
import { VetoState, VetoStepType } from '../../../../data/veto.data';
import { MapsService } from '../../../../services/maps.service';
import { Maps } from '../../../../data/maps.data';
import { NgOptimizedImage } from '@angular/common';
import { Copyright } from '../../../../shared-components/copyright/copyright';
import { VetoStore } from '../../../../store/veto-store';

export interface VetoResultData {
  map: Maps,
  user: string,
  veto: boolean;
  no: number;
  order: number;  
}

@Component({
  selector: 'app-veto-result',
  imports: [NgOptimizedImage, Copyright],
  templateUrl: './veto-result.html',
  styleUrl: './veto-result.scss'
})
export class VetoResult {
  state = inject(VetoStore);  
  mapService = inject(MapsService);

  isVetoDone = computed(() => {  
    return this.state.currentGameState().vetoState === VetoState.VETO_DONE;
  });

  vetoResult = computed(() => {
    const result: VetoResultData[] = [];
    let counter = 0;    
    let order: number = 0;
    const configuredMaps = this.mapService.getMapsByNames(this.state.gameId(), this.state.modus(), this.state.maps());
    this.state.currentGameState().vetoSteps.forEach(x => {
       order = x.stepType === VetoStepType.Ban ? 0 : order + 1;
       const map = configuredMaps.filter(y => y.name === x.map);
      result.push({no: ++counter, 
                  veto: x.stepType === VetoStepType.Ban, 
                  map: map ? map[0] : {name: x.map} as Maps, 
                  user: this.getName(x.playerId), order
                });
    })
    return result;
  });  
  
  getName(playerId: string): string {
    const thisIsMe = this.state.attendee().userId;
    const iAmPlayerA = this.state.attendee().userName === this.state.playerA();
    return playerId === thisIsMe ? 
        (iAmPlayerA ? this.state.playerA() : this.state.playerB()) 
      : (iAmPlayerA ? this.state.playerB() : this.state.playerA());
  }
}
