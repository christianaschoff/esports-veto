import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { BestOf, GameModes } from '../../data/gamemodes.data';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { VETO_ACTION } from '../../data/veto-constellation.data';
import { VetoConstellationService } from '../../services/veto-constellation.service';
import { MatButtonModule } from '@angular/material/button';
import { VetoConfigurationStore } from '../../store/veto-configuration-store';

@Component({
  selector: 'app-veto-system',
  imports: [MatButtonModule, MatRadioModule, MatIconModule, MatListModule, FormsModule],
  templateUrl: './veto-system.html',
  styleUrl: './veto-system.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VetoSystem {
  state = inject(VetoConfigurationStore);
  vetoConstellationService = inject(VetoConstellationService);  
  isVetoDetailsVisible = signal(false);
  GameModes = GameModes;
  BestOf = BestOf;

  vetoOveral = computed(() => {    
    return this.vetoConstellationService.calculate(this.state.constellation());    
  });

  veto = computed(() => {    
    return this.vetoOveral().filter(x => x.actionType === VETO_ACTION.VETO);
  });

  pick = computed(() => {    
    return this.vetoOveral().filter(x => x.actionType === VETO_ACTION.PICK);
  });

  showHideVeto() {
    this.isVetoDetailsVisible.update((show) => !show);
  }
  setVetoSystem(s: string) {
    this.state.updateVetoSystem(s);  
  }  
}
