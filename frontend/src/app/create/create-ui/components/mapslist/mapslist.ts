import { Component, computed, inject, Input, signal, Signal } from '@angular/core';
import { MapsService } from '../../../../services/maps.service';
import { Maps } from '../../../../data/maps.data';
import { NgOptimizedImage } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BestOf, GameModes } from '../../../../data/gamemodes.data';
import { TranslateService } from '../../../../services/translate.service';
import { VetoConfigurationStore } from '../../../../store/veto-configuration-store';
import { Copyright } from '../../../../shared-components/copyright/copyright';

@Component({
  selector: 'app-mapslist',
  imports: [MatIconModule, NgOptimizedImage, Copyright],
  templateUrl: './mapslist.html',
  styleUrl: './mapslist.scss'
})
export class Mapslist {  

  state = inject(VetoConfigurationStore);
  translateService = inject(TranslateService);
  isVisible = computed(() => this.state.modus() !== GameModes.UNSET && this.state.bestOf() !== BestOf.UNSET);
  maplist: Signal<Maps[]> = computed(() => this.mapsService.getMaps(this.state.gameId(), this.state.modus()));
  hasImages = computed(() => this.maplist().filter(x => (x.image && x.image.length > 0) ?? false).length > 0);
  constructor(private readonly mapsService: MapsService){
  }
}
