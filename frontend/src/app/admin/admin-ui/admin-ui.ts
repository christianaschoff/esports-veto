import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RemoteService } from '../../services/remote.service';
import { ATTENDEE_TYPE, ConstellationResponse } from '../../data/veto-constellation.data';
import { ActivatedRoute } from '@angular/router';
import { map, Subscription } from 'rxjs';
import { NoActiveSessions } from '../../shared-components/no-active-sessions/no-active-sessions';
import { TranslateService } from '../../services/translate.service';
import { GameModes } from '../../data/gamemodes.data';
import { FileSaverModule, FileSaverService } from 'ngx-filesaver';
import { MatFabButton } from '@angular/material/button';
import { sanitize } from "sanitize-filename-ts";
import { MatIconModule } from '@angular/material/icon';
import { SocialmediaService } from '../../services/socialmedia.service';

@Component({
  selector: 'app-admin-ui',
  imports: [NoActiveSessions, FileSaverModule, MatFabButton, MatIconModule],
  templateUrl: './admin-ui.html',
  styleUrl: './admin-ui.scss'
})
export class AdminUi implements OnDestroy {
  routeSub$: Subscription;
  private remoteService = inject(RemoteService);
  private activeRoute = inject(ActivatedRoute);
  private socialMediaService = inject(SocialmediaService);
  translateService = inject(TranslateService);
  fileSaver = inject(FileSaverService);
  
  constellation = signal<ConstellationResponse|undefined>(undefined);
  hasErrors = signal(false);
  
  ATTENDEE_TYPE = ATTENDEE_TYPE;
  GameModes = GameModes;

  filename = computed(() => {
    if(this.constellation()) { 
      return sanitize(`${this.constellation()?.title}-${this.constellation()?.playerA}-${this.constellation()?.playerB}.txt`)
    }
    return 'unknown.txt';
  });

  text = computed(() => {
    if(this.constellation()) {
      return `${this.constellation()?.title}
  Modus: ${this.translateService.getGamemodeTextFromString(this.constellation()?.mode ?? '')}
  Series: ${this.translateService.getBestofTextFromString(this.constellation()?.bestOf ?? '')}\n
  Admin: ${this.generateUrl(ATTENDEE_TYPE.ADMIN, this.constellation()?.vetoId)}\n
  ${this.constellation()?.playerA }: ${this.generateUrl(ATTENDEE_TYPE.PLAYER, this.constellation()?.playerAId)}
  ${this.constellation()?.playerB }: ${this.generateUrl(ATTENDEE_TYPE.PLAYER, this.constellation()?.playerBId)}\n
  Observer: ${this.generateUrl(ATTENDEE_TYPE.OBSERVER, this.constellation()?.observerId)}
        `;
    }
    return '';
  });

  constructor() {      
        this.routeSub$ = this.activeRoute.paramMap.pipe(map(async params => {
        var id = params.get('id');          
        if(id) {
          var result = await this.remoteService.loadRemoteVetoAdminAsync(id).catch(error => this.hasErrors.set(true));
          if(result) {
            this.constellation.set(result);            
            document.title = `Veto Admin: ${this.constellation()?.title}`;            
          }
        }
      })).subscribe();
  }

  ngOnDestroy(): void {
    if(this.routeSub$) {
      this.routeSub$.unsubscribe();
    } 
  }

  saveFile() {
    if(this.fileSaver.isFileSaverSupported) {      
      this.fileSaver.saveText(this.text(), this.filename(), {type: "text/plain;charset=utf-8"});
    }
  }

  generateUrl(attendeeType: ATTENDEE_TYPE, id?: string) {    

    if(!id) {
      return '-';
    }
    var subroute = '';
    switch(attendeeType) {
      case ATTENDEE_TYPE.ADMIN: 
        subroute = 'admin';
        break;
      case ATTENDEE_TYPE.OBSERVER: 
        subroute = 'observe';
        break;
      case ATTENDEE_TYPE.PLAYER: 
        subroute = 'veto/player';
        break;
      }
    return document.location.protocol +'//'+ document.location.hostname + (document.location.port ? ':' : '') + document.location.port + '/' + subroute + '/' + id;
  }

}
