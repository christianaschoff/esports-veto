import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { BestOf, GameModes } from '../../../../data/gamemodes.data';
import { VetoConfigurationStore } from '../../../../store/veto-configuration-store';

@Component({
  selector: 'app-additional-information',
  imports: [CommonModule, MatInputModule, MatFormFieldModule, FormsModule],
  templateUrl: './additional-information.html',
  styleUrl: './additional-information.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdditionalInformation {
  state = inject(VetoConfigurationStore);  
  isVisible = computed(() => this.state.vetoSystem());

  playerOrTeamname = computed(() => {
    const modus = this.state.modus();
    if (modus === GameModes.M1V1) {
      return "Player";
    }
    if (modus === GameModes.UNSET) { 
      return "Player/Team";
    }
    return "Team";            
  });

  updateTitle(s: string) {    
    this.state.updateVetoTitle(s);
  }

  updatePlayerA(s: string) {  
    this.state.updatePlayerA(s);     
  }

  updatePlayerB(s: string) {
    this.state.updatePlayerB(s);      
  }
}
