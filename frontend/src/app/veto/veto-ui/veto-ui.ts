import { Component,  computed,  effect, inject, OnDestroy, OnInit,signal } from '@angular/core';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { ActivatedRoute } from '@angular/router';
import { SignalrService } from '../../services/signalr.service';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MaplistVeto } from './components/maplist-veto/maplist-veto';
import { NoActiveSessions } from "../../shared-components/no-active-sessions/no-active-sessions";
import { VetoStore } from '../../store/veto-store';
import { VetoStateDisplay } from './components/veto-state-display/veto-state-display';
import { VetoResult } from './components/veto-result/veto-result';
import { ConnectionStatus } from '../../shared-components/connection-status/connection-status';
import { VetoStepType } from '../../data/veto.data';

@Component({
  selector: 'app-veto-ui',
  imports: [MatButtonModule, MatRadioModule, MatIconModule, MatListModule, FormsModule, MaplistVeto, VetoStateDisplay, VetoResult, NoActiveSessions],
  templateUrl: './veto-ui.html',
  styleUrl: './veto-ui.scss'
})
export class VetoUi implements OnInit, OnDestroy {

  route = inject(ActivatedRoute);  
  private breadcrumbService = inject(BreadcrumbService);
  vetohub = inject(SignalrService);
  state = inject(VetoStore);

  routeId = signal('');
  attendee = signal('');
  localLoadingBatch = signal(true);
  sessionGiven = computed(() => this.attendee() && this.routeId() && !this.state.hasErrors());
  soundEnabled = signal(localStorage.getItem('soundEnabled') !== 'false'); // default true
  private previousIsMyTurn = false;  

  constructor() {
    this.route.params.subscribe((params) => {
      const attendee = params['attendee'];
      const id = params['id'];
      if(id && attendee) {
        this.routeId.set(id);  
        this.attendee.set(attendee);                
        if(this.attendee() && this.routeId()) {
          this.state.joinSession(this.attendee(), this.routeId());          
        }        
      } else {        
        this.state.reset();
        this.routeId.set('');
        this.attendee.set('');
        this.vetohub.leave();
      }
    });
    
    effect(async () => {
      if(this.state.attendee() && this.state.attendee().vetoId) {
        await this.vetohub.joinVetoHub(this.state.attendee().vetoId,this.state.attendee().userId, this.state.attendee().userName);
        await this.state.loadByVetoId(this.state.attendee().vetoId);
        document.title = `Veto: ${this.state.vetoTitle()} - ${this.state.attendee().userName}`
        this.localLoadingBatch.set(false);
      }
    });

    effect(() => {
      const steps = this.state.currentGameState().vetoSteps;
      const userId = this.state.attendee().userId;
      if (!userId || steps.length === 0) return;

      const nextIndex = steps.findIndex(s => s.stepType === VetoStepType.Unset);
      if (nextIndex === -1) return; // veto finished

      const isMyTurn = steps[nextIndex].playerId === userId;
      if (isMyTurn && !this.previousIsMyTurn) {
        this.playSound();
      }
      this.previousIsMyTurn = isMyTurn;
    });
  }
  ngOnDestroy(): void {
    this.vetohub.leave();
  }
  
  ngOnInit(): void {
    this.breadcrumbService.addPath([{ path: '/veto', displayName: 'Veto' }]);
  }
  
  handleMapSelection(selectedMap: string) {
      if(selectedMap) {
        this.vetohub.updateVeto(this.state.attendee().vetoId, selectedMap);
      }
  }

  toggleSound() {
    this.soundEnabled.set(!this.soundEnabled());
    localStorage.setItem('soundEnabled', this.soundEnabled().toString());
  }

  private playSound() {
    if (!this.soundEnabled()) return;
    try {
      if (this.isSafari()) {
        this.showNotification();
      } else {
        const audio = new Audio('/audio/light-562.mp3');
        audio.play().catch(() => {});
      }
    } catch (error) {
      console.warn('Could not play sound:', error);
    }
  }

  private isSafari(): boolean {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }

  private showNotification() {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Your veto turn!');
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Your veto turn!');
          }
        });
      }
    }
  }

}
