import { Component, computed, inject } from '@angular/core';
import { VetoStore } from '../../store/store';
import { VetoState } from '../../data/veto.data';

@Component({
  selector: 'app-veto-state-display',
  imports: [],
  templateUrl: './veto-state-display.html',
  styleUrl: './veto-state-display.scss'
})
export class VetoStateDisplay {

  state = inject(VetoStore);    
  VetoStateEnum=VetoState;

  currentState = computed(() => {  
    return this.state.currentGameState().vetoState as VetoState;
  });

  amIPlayerA = computed(() => {
    return this.state.attendee.userId() === this.state.currentGameState().vetoSteps[0].playerId;
  });


}
