import { Component, computed, effect, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GlobalStore, ObserverStore, VetoStore } from '../../store/store';
import { SignalrService } from '../../services/signalr.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { MapsStateOfPlayObserver, VetoState, VetoStep } from '../../data/veto.data';
import { MapsService } from '../../services/maps.service';
import { VetoConstellationService } from '../../services/veto-constellation.service';
import { NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { AnimationStyle, Size } from '../../data/oberserver.data';
import {Dialog} from '@angular/cdk/dialog';
import { ObserveSettingsPopup } from '../../shared-components/observe-settings-popup/observe-settings-popup';
import { TranslateService } from '../../services/translate.service';

@Component({
  selector: 'app-observe-ui',
  imports: [NgOptimizedImage, MatButtonModule, MatIconModule, MatButtonToggleModule, MatSlideToggleModule, FormsModule],
  templateUrl: './observe-ui.html',
  styleUrl: './observe-ui.scss'
})
export class ObserveUi implements OnInit, OnDestroy {
  
  private routeId = signal('');
  private vetohub = inject(SignalrService);
  private breadcrumbService = inject(BreadcrumbService);
  private mapService = inject(MapsService);
  private vetoConstellationService = inject(VetoConstellationService);
  private route = inject(ActivatedRoute);
  
  state = inject(VetoStore);
  dialog = inject(Dialog);
  osState = inject(ObserverStore);
  translate = inject(TranslateService);
  globalState = inject(GlobalStore);

  VetoState = VetoState;
  AnimationStyle = AnimationStyle;
  Size = Size;

  sessionGiven = computed(() => this.routeId());
  show = signal(true);

  livePreview = signal(false);
  isSettingsVisible = signal(false);  
  stepCounter = signal(0);
  bestOfText = computed(() => this.translate.getBestofText(this.state.bestOf()));

  bans = computed(() => this.show() ? this.mapStatus().filter(x => x.pickNo === 0) : []);  
  picks = computed(() => this.show() ? this.mapStatus().filter(x => x.pickNo > 0) : []);    
  bansOneByOne = computed(() => this.mapStatus().filter(x => x.pickNo === 0 && x.id < this.stepCounter()));  
  picksOneByOne = computed(() => this.mapStatus().filter(x => x.pickNo > 0 && x.id < this.stepCounter()));
  bansOneByOneAndCurrent = computed(() => this.state.currentGameState().vetoState === VetoState.VETO_DONE ? this.bansOneByOne() : this.bans());
  picksOneByOneAndCurrent = computed(() => this.state.currentGameState().vetoState === VetoState.VETO_DONE ? this.picksOneByOne() : this.picks());

  mapStatus = computed(() => 
      {              
          const configuredMaps = this.mapService.getMapsByNames(this.state.gameId(), this.state.modus(), this.state.maps());
          const vetoStateOfPlay = this.state.currentGameState().vetoSteps;
          const playerAId = vetoStateOfPlay.length > 0 ? vetoStateOfPlay[0].playerId : '';

          const returnList: MapsStateOfPlayObserver[] = [];
          let counter = 0;
          vetoStateOfPlay.forEach(veto => {
            const findMap = configuredMaps.filter(x => x.name === veto.map);
            if(findMap.length > 0) {
              returnList.push( {
                  id: counter++,
                  map: findMap[0],
                  state: veto.stepType,
                  pickNo: this.getPickNoOfMap(findMap[0].name, vetoStateOfPlay),
                  playerName: this.getPlayerName(veto.playerId, playerAId)
              });
            }
          });               
          return returnList;
      }
  );
  
  constructor() {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if(id) {
        this.routeId.set(id);
        this.state.joinSession('observer', this.routeId());
        this.globalState.setIsOberserverView(true);
      }
      else {        
        this.state.reset();
        this.routeId.set('');
        this.vetohub.leave();
      }
    });

    effect(async () => {          
      if(this.state.attendee() && this.state.attendee().vetoId) {
        await this.vetohub.joinVetoHub(this.state.attendee().vetoId, this.state.attendee().userId, this.state.attendee().userName);
        await this.state.loadByVetoId(this.state.attendee().vetoId);                
      }        
    });
  }

  ngOnDestroy(): void {
    this.vetohub.leave();
    this.globalState.setIsOberserverView(false);
  }

  ngOnInit(): void {
    this.breadcrumbService.addPath([{ path: '/observe', displayName: 'Observe' }]);
  }

  getPickNoOfMap(mapname: string, vetoStateOfPlay: VetoStep[]): number {
      const index = vetoStateOfPlay.findIndex(x => x.map === mapname);
      if(index == -1) {
        return 0;
      }
  
      const toBan = 9 - this.vetoConstellationService.getMapsNumber(this.state.bestOf());
      const pickNo = (index + 1) - toBan;
      return pickNo > 0 ? pickNo : 0;
  }

  getPlayerName(curentId: string, playerAId: string) {
    return curentId === playerAId ? this.state.playerA() : this.state.playerB();
  }

  replay() {
      this.show.set(false);
      window.setTimeout(() => this.show.set(true), 100)
  }

  @HostListener('document:keydown.arrowright', ['$event'])
  moveNext(event: unknown) {    
    const e = event as KeyboardEvent;
    this.step(1);
    e.preventDefault();
  }
  @HostListener('document:keydown.arrowleft', ['$event'])
  movePrev(event: unknown) {    
    const e = event as KeyboardEvent;    
    this.step(-1);
    e.preventDefault();
  }

  @HostListener('document:keydown.arrowdown', ['$event'])
  moveEnd(event: unknown) {    
    const e = event as KeyboardEvent;  
    let currentStep = this.stepCounter();
    const allMapsCount = this.mapStatus().length;
    
    while(currentStep < allMapsCount || currentStep > 100) {       
      window.setTimeout(() => this.step(1), 500 * (allMapsCount - currentStep - 1));
      currentStep++;
    }
    e.preventDefault();
  }

  @HostListener('document:keydown.arrowup', ['$event'])
  moveStart(event: unknown) {    
    const e = event as KeyboardEvent;
    this.step(0);
    e.preventDefault();
  }

  @HostListener('document:keydown.control.f', ['$event'])
  toggleFullscreen(event: unknown) {    
    const e = event as KeyboardEvent;
    this.osState.updateFullscreen(!this.osState.fullscreen());
    e.preventDefault();
  }

  @HostListener('document:keydown.control.d', ['$event'])
  toggleVetoInformation(event: unknown) {    
    const e = event as KeyboardEvent;
    this.osState.updateShowVetoInfo(!this.osState.showVetoInfo());
    e.preventDefault();
  }

  step(no: number) {
    let newVal = this.stepCounter() + no;
    if(no === 0 || newVal <= 0) {
      newVal = 0;
    }
    if(newVal >= this.mapStatus().length) {
      newVal = this.mapStatus().length;
    }
   this.stepCounter.set(newVal);
  }

/*
  setLivePreview($event: boolean) {
    this.livePreview.set($event);
  }
*/
  showHideSettings() {
    if(!this.isSettingsVisible()) {
     this.dialog.open(ObserveSettingsPopup,
    {   
          autoFocus: true,
          hasBackdrop: true,
          disableClose: false,
        }
      );
    }    
  }
}
