import { Component, computed, inject, Input, signal, Signal } from '@angular/core';
import { MapsService } from '../../services/maps.service';
import { Maps } from '../../data/maps.data';
import { NgOptimizedImage } from '@angular/common';
import { VetoConfigurationStore } from '../../store/store';
import { Copyright } from "../copyright/copyright";
import { MatIconModule } from '@angular/material/icon';
import { BestOf, GameModes } from '../../data/gamemodes.data';

@Component({
  selector: 'app-mapslist',
  imports: [MatIconModule, NgOptimizedImage, Copyright],
  templateUrl: './mapslist.html',
  styleUrl: './mapslist.scss'
})
export class Mapslist {  

  state = inject(VetoConfigurationStore);
  isVisible = computed(() => this.state.modus() !== GameModes.UNSET && this.state.bestOf() !== BestOf.UNSET);
  maplist: Signal<Maps[]> = computed(() => this.mapsService.getMaps(this.state.gameId(), this.state.modus()));
  hasImages = computed(() => this.maplist().filter(x => (x.image && x.image.length > 0) ?? false).length > 0);
  constructor(private readonly mapsService: MapsService){
  }
}
