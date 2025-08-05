import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as signalR from '@microsoft/signalr';
import { VetoConfigurationStore, VetoStore } from '../store/store';
import { Veto, VetoStepType } from '../data/veto.data';

export interface IGameState {
  vetoState: number
}

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private hubConnection: signalR.HubConnection;
  vetoStore = inject(VetoStore);
  constructor() { 
    this.hubConnection = new signalR.HubConnectionBuilder()
    
    .withUrl(environment.apiBaseUrl + '/api/veto')
    .configureLogging(signalR.LogLevel.Information)
    .withAutomaticReconnect()
    .build();
    // console.log('configured', this.hubConnection.baseUrl);

     this.hubConnection.on('JoinedGroup', (user, id, state: Veto) => {
      // console.log('user:', user, 'id', id, 'gamestate', state);
      this.vetoStore.updateCurrentGameState(state);
     });

     this.hubConnection.on('LeftGroup', (message, state: Veto) => {
      // console.error(message, 'gamestate', state);
      this.vetoStore.updateCurrentGameState(state);
     });

     this.hubConnection.on('VetoUpdated', (message, state: Veto) => {
      // console.info(message, 'gamestate', state);
      this.vetoStore.updateCurrentGameState(state);
     });
  }

public async leave() {
    await this.hubConnection.stop();    
  }

  public async updateVeto(id: string, map: string) {
    await this.connect();
    await this.hubConnection.invoke('UpdateVeto', id, map);
  }

  public async joinVetoHub(id: string, userId: string, user: string) {   
    await this.connect();
    await this.hubConnection.invoke('JoinGroup', id, userId, user);
  }
  
  private async connect() {    
    if(this.hubConnection.state !== signalR.HubConnectionState.Connected) {      
      try {
        await this.hubConnection.start();        
      } catch (err) {
        console.log('connecting to hub error: ', err); 
      }
    }
  }

}
