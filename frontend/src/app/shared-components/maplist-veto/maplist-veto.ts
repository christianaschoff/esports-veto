import { Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { VetoStore } from '../../store/store';
import { MapsService } from '../../services/maps.service';
import { Maps } from '../../data/maps.data';
import { MapsStateOfPlay, VetoState, VetoStep, VetoStepType } from '../../data/veto.data';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {Dialog, DialogRef, DIALOG_DATA, DialogModule} from '@angular/cdk/dialog';
import { VetoPopup } from '../veto-popup/veto-popup';
import { FormsModule } from '@angular/forms';
import { VetoConstellationService } from '../../services/veto-constellation.service';
import { Copyright } from "../copyright/copyright";

@Component({
  selector: 'app-maplist-veto',
  imports: [CommonModule, FormsModule, DialogModule, MatIconModule, NgOptimizedImage, Copyright],  
  templateUrl: './maplist-veto.html',
  styleUrl: './maplist-veto.scss'
})
export class MaplistVeto {
  dialog = inject(Dialog);
  state = inject(VetoStore);
  mapService = inject(MapsService);
  vetoConstellationService = inject(VetoConstellationService);

  VetoStepType = VetoStepType;

  
  @Output()
  propageMapSelection = new EventEmitter<string>()
  
  isVetoDone = computed(() => this.state.currentGameState().vetoState === VetoState.VETO_DONE);

  itIsMyTurn = computed(() => {
      const iAmPlayerA =  this.state.attendee.userId() === this.state.currentGameState().vetoSteps[0].playerId
        return (iAmPlayerA && this.state.currentGameState().vetoState === VetoState.VETO_MISSING_A)
              || (!iAmPlayerA && this.state.currentGameState().vetoState === VetoState.VETO_MISSING_B);
      ;
  });

  mapStatus = computed(() => 
      {              
          const configuredMaps = this.mapService.getMapsByNames(this.state.gameId(), this.state.modus(), this.state.maps());
          const vetoStateOfPlay = this.state.currentGameState().vetoSteps;
          const returnList: MapsStateOfPlay[] = [];
          let counter = 0;
          // this is only feasable for a small amount of maps... 
          // if there are more (how ever there should be, but who knows), we need to find a better way... 
          configuredMaps.forEach(map =>  {
            const findVetoStateOfMap = vetoStateOfPlay.filter(x => x.map === map.name);
            if(findVetoStateOfMap.length > 0) {
              returnList.push({id: counter++,
                               map,
                               state: findVetoStateOfMap[0].stepType,
                               pickNo: this.getPickNoOfMap(map.name, vetoStateOfPlay)
                              });
            } else {
              returnList.push({id: counter++, 
                               map, 
                               state: VetoStepType.Unset, 
                               pickNo: 0 
                              });
            }
          });          
          return returnList;
      }
  );
  
  // this is bluntly fixed to 9 map, because starcraft2 is the mvp case
  getPickNoOfMap(mapname: string, vetoStateOfPlay: VetoStep[]): number {
    const index = vetoStateOfPlay.findIndex(x => x.map === mapname);
    if(index == -1) {
      return 0;
    }

    const toBan = 9 - this.vetoConstellationService.getMapsNumber(this.state.bestOf());
    const pickNo = (index + 1) - toBan;
    return pickNo > 0 ? pickNo : 0;
  }


  isBan(vetoStateOfMap: VetoStepType) {
    if(!this.itIsMyTurn() || vetoStateOfMap !== VetoStepType.Unset) {
      return false;
    }
    
    const toBan = 9 - this.vetoConstellationService.getMapsNumber(this.state.bestOf());
    const currentVetoInteraction = this.state.currentGameState().vetoSteps.findIndex(x => x.stepType === VetoStepType.Unset);
    return currentVetoInteraction < toBan;    
  }

  isPick(vetoStateOfMap: VetoStepType) {
    if(!this.itIsMyTurn() || vetoStateOfMap !== VetoStepType.Unset) {
      return false;
    }
    
    const toBan = 9 - this.vetoConstellationService.getMapsNumber(this.state.bestOf());
    const currentVetoInteraction = this.state.currentGameState().vetoSteps.findIndex(x => x.stepType === VetoStepType.Unset);
    return currentVetoInteraction >= toBan;    
  }

  openDialog(id: number, isVeto: boolean) {    
    if(!this.itIsMyTurn()) {
      return;
    }
    const map = this.mapStatus()[id];
    if(map) {
      const dialogRef = this.dialog.open<boolean>(VetoPopup,
        {                       
          autoFocus: true,
          hasBackdrop: true,
          disableClose: true,    
          data: {mapname: map.map.name, mapimage: map.map.image, isVeto},
        }
      );
      dialogRef.closed.subscribe(result => {          
          if(result) {            
            this.propageMapSelection.emit(map.map.name);
          }
      });
    }
  }

}
