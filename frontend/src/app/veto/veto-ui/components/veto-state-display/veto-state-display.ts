import { Component, computed, inject } from '@angular/core';
import { VetoState, VetoStepType } from '../../../../data/veto.data';
import { VetoStore } from '../../../../store/veto-store';
import { VetoConstellationService } from '../../../../services/veto-constellation.service';
import { VETO_ACTION } from '../../../../data/veto-constellation.data';

@Component({
  selector: 'app-veto-state-display',
  imports: [],
  templateUrl: './veto-state-display.html',
  styleUrl: './veto-state-display.scss'
})
export class VetoStateDisplay {

  state = inject(VetoStore);    
  vetoConstellationService = inject(VetoConstellationService);
  VetoStateEnum=VetoState;

  currentState = computed(() => {  
    return this.state.currentGameState().vetoState as VetoState;
  });

  isVeto = computed(() => 
  {
    const vetoSteps = this.state.currentGameState().vetoSteps;
    const nextStepIndex = vetoSteps.findIndex(step => step.stepType === VetoStepType.Unset);
    if (nextStepIndex === -1) return false; 

    // this is a little hack
    const constellation = {
      bestOf: this.state.bestOf(),
      playerA: this.state.playerA(),
      playerB: this.state.playerB(),
      vetoSystem: this.state.vetoSystem(),
      gameid: this.state.gameId(),
      mode: this.state.modus(),
      maps: this.state.maps()
    };
    const rounds = this.vetoConstellationService.calculate(constellation);
    const nextRound = rounds[nextStepIndex];
  
    return nextRound?.actionType === VETO_ACTION.VETO;
  });
  

  amIPlayerA = computed(() => {
    return this.state.attendee.userId() === this.state.currentGameState().vetoSteps[0].playerId;
  });


}
