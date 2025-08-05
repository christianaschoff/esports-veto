import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RemoteService } from '../../services/remote.service';
import { ATTENDEE_TYPE, ConstellationResponse } from '../../data/veto-constellation.data';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, Subscription } from 'rxjs';
import { NoActiveSessions } from '../../shared-components/no-active-sessions/no-active-sessions';
import { TranslateService } from '../../services/translate.service';
import { GameModes } from '../../data/gamemodes.data';

@Component({
  selector: 'app-admin-ui',
  imports: [NoActiveSessions],
  templateUrl: './admin-ui.html',
  styleUrl: './admin-ui.scss'
})
export class AdminUi implements OnDestroy {
    remoteService = inject(RemoteService);
    activeRoute = inject(ActivatedRoute);
    translateService = inject(TranslateService);
    constellation = signal<ConstellationResponse|undefined>(undefined);
    routeSub$: Subscription;
    hasErrors = signal(false);
    ATTENDEE_TYPE = ATTENDEE_TYPE;
    GameModes = GameModes;
    constructor() {      
         this.routeSub$ = this.activeRoute.paramMap.pipe(map(async params => {
          var id = params.get('id');          
          if(id) {
            var result = await this.remoteService.loadRemoteVetoAdminAsync(id).catch(error => this.hasErrors.set(true));
            if(result) {
              this.constellation.set(result);
            }
          }
        })).subscribe();
    }
  ngOnDestroy(): void {
    if(this.routeSub$) {
      this.routeSub$.unsubscribe();
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
