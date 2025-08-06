import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, Signal, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { GameData } from '../../data/game-data.data';
import { GamesService } from '../../services/games.service';
import { CommonModule } from '@angular/common';
import {MatButtonToggleModule } from '@angular/material/button-toggle';
import { BestOf, GameModes } from '../../data/gamemodes.data';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RemoteService } from '../../services/remote.service';
import { ConstellationResponse, ATTENDEE_TYPE } from '../../data/veto-constellation.data';
import { Qrcode } from "../qrcode/qrcode";
import { Mapslist } from "../mapslist/mapslist";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GlobalStore, VetoConfigurationStore } from '../../store/store';
import { AdditionalInformation } from "../additional-information/additional-information";
import { VetoSystem } from "../veto-system/veto-system";
import { TranslateService } from '../../services/translate.service';

@Component({
  selector: 'app-mode-selection',
  imports: [CommonModule, MatButtonToggleModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatProgressSpinnerModule, ReactiveFormsModule, FormsModule, Qrcode, Mapslist, AdditionalInformation, VetoSystem],
  templateUrl: './mode-selection.html',
  styleUrl: './mode-selection.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModeSelection implements OnInit, OnDestroy {
  GameModes = GameModes;
  BestOf = BestOf;
  ATTENDEE_TYPE = ATTENDEE_TYPE;

  routeSub$?: Subscription;
  createSub$?: Subscription;

  game: Signal<GameData | null> = signal(null);
  createdConstellation: WritableSignal<ConstellationResponse|undefined> = signal(undefined);
  creationErrorText = signal('');

  isVetoDetailsVisible: WritableSignal<boolean> = signal(false); 
  globalState = inject(GlobalStore);
  state = inject(VetoConfigurationStore);
  constructor(private readonly route: ActivatedRoute,              
              private readonly gamesService: GamesService,              
              private readonly breadcrumbService: BreadcrumbService,              
              readonly remoteService: RemoteService,
              readonly translateService: TranslateService) {
  }
  ngOnDestroy(): void {
    if(this.routeSub$) {
      this.routeSub$.unsubscribe();
    }
    if(this.createSub$) {
      this.createSub$.unsubscribe();
    }
    this.state.reset();
  }

  ngOnInit() {
   this.routeSub$ = this.route.paramMap.pipe(
      map(params => {
        var id = params.get('id');
        this.state.updateGameId(id ? id : '');
        this.breadcrumbService.addPath([{ path: '/new', displayName: 'New' }, {path: '', displayName: id??''}]);
        this.game = (this.gamesService.getDataById(id ? id : undefined))
      })
    ).subscribe();        
  }
  
  createVeto() {    
    this.creationErrorText.set('');
    this.createSub$ = this.remoteService.createRemoteVeto(this.state.constellation()).subscribe(
      {
        next:(created) => {
          this.createdConstellation.set(created);
          window.setTimeout(() => document.getElementById('veto-done')?.scrollIntoView({behavior: 'smooth'}), 1);
        },
        error: (error) => {
          this.creationErrorText.set(error.error);
          this.globalState.setLoading(false);
        }
      }      
    );
  }

  setModus(v: GameModes) {    
    this.state.updateModus(v);    
  }

  setBestOf(v: BestOf) {
    this.state.updateBestOf(v);    
  }
}
