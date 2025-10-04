import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import * as signalR from '@microsoft/signalr';

import { Veto } from '../data/veto.data';
import { VetoStore } from '../store/veto-store';

export interface IGameState {
  vetoState: number
}

export enum ConnectionState {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Reconnecting = 'reconnecting',
  Failed = 'failed'
}

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private hubConnection: signalR.HubConnection;
  vetoStore = inject(VetoStore);

  // Connection state signals
  connectionState = signal<ConnectionState>(ConnectionState.Disconnected);
  connectionError = signal<string>('');

  // Current session info for reconnection
  private currentVetoId = signal<string>('');
  private currentUserId = signal<string>('');
  private currentUserName = signal<string>('');

  // Heartbeat
  private heartbeatInterval?: number;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds

  constructor() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.apiBaseUrl + '/api/veto')
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Stop after 3 retries to trigger OnDisconnectedAsync sooner
          if (retryContext.previousRetryCount >= 3) {
            console.log('Max reconnection attempts reached, giving up');
            return null; // Stop reconnecting
          }
          // Exponential backoff with max 10 seconds
          const delay = Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 10000);
          console.log(`Reconnecting in ${delay}ms... (attempt ${retryContext.previousRetryCount + 1})`);
          return delay;
        }
      })
      .build();

    this.setupConnectionHandlers();
    this.setupEventHandlers();
    this.setupVisibilityAndNetworkHandlers();
  }

  private setupConnectionHandlers() {
    this.hubConnection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
      this.connectionState.set(ConnectionState.Reconnecting);
      this.connectionError.set('');
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR reconnected - updating UI to Connected');
      this.connectionState.set(ConnectionState.Connected);
      this.connectionError.set('');
      // Re-join current session after reconnection
      this.rejoinCurrentSession();
      // Restart heartbeat
      this.startHeartbeat();
    });

    this.hubConnection.onclose((error) => {
      console.log('SignalR connection closed', error);
      this.connectionState.set(ConnectionState.Disconnected);
      this.stopHeartbeat();
      if (error) {
        this.connectionError.set(error.message || 'Connection lost');
      }
    });
  }

  private setupEventHandlers() {
    this.hubConnection.on('JoinedGroup', (user, id, state: Veto) => {
      console.log('Joined group:', user, id);
      this.vetoStore.updateCurrentGameState(state);
    });

    this.hubConnection.on('LeftGroup', (message, state: Veto) => {
      console.error('Left group:', message);
      this.vetoStore.updateCurrentGameState(state);
    });

    this.hubConnection.on('VetoUpdated', (message, state: Veto) => {
      console.info('Veto updated:', message);
      this.vetoStore.updateCurrentGameState(state);
    });
  }

  private setupVisibilityAndNetworkHandlers() {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('Page hidden, pausing heartbeat');
        this.stopHeartbeat();
      } else {
        console.log('Page visible, resuming heartbeat');
        if (this.connectionState() === ConnectionState.Connected) {
          this.startHeartbeat();
        }
      }
    });

    // Handle network changes
    window.addEventListener('online', () => {
      console.log('Network online, current state:', this.connectionState());
      // Only attempt reconnection if not connected and not already reconnecting
      if (this.connectionState() === ConnectionState.Disconnected ||
          this.connectionState() === ConnectionState.Failed) {
        this.ensureConnected().catch(err => console.error('Failed to reconnect on network online:', err));
      }
    });

    window.addEventListener('offline', () => {
      console.log('Network offline');
      this.connectionState.set(ConnectionState.Disconnected);
      this.stopHeartbeat();
    });
  }

  private rejoinCurrentSession() {
    const vetoId = this.currentVetoId();
    const userId = this.currentUserId();
    const userName = this.currentUserName();

    if (vetoId && userId && userName) {
      console.log('Re-joining veto session after reconnection');
      this.joinVetoHub(vetoId, userId, userName).catch(err => {
        console.error('Failed to re-join session:', err);
      });
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat(); // Clear any existing
    this.heartbeatInterval = window.setInterval(() => {
      if (this.connectionState() === ConnectionState.Connected) {
        this.sendHeartbeat();
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  private async sendHeartbeat() {
    try {
      await this.hubConnection.invoke('Heartbeat', this.currentUserId());
    } catch (error) {
      console.warn('Heartbeat failed:', error);
    }
  }

  public async leave() {
    this.stopHeartbeat();
    this.currentVetoId.set('');
    this.currentUserId.set('');
    this.currentUserName.set('');
    await this.hubConnection.stop();
    this.connectionState.set(ConnectionState.Disconnected);
  }

  public async updateVeto(id: string, map: string) {
    await this.ensureConnected();
    await this.hubConnection.invoke('UpdateVeto', id, map);
  }

  public async joinVetoHub(id: string, userId: string, user: string) {
    // Store session info for reconnection
    this.currentVetoId.set(id);
    this.currentUserId.set(userId);
    this.currentUserName.set(user);

    await this.ensureConnected();
    await this.hubConnection.invoke('JoinGroup', id, userId, user);
  }

  private async ensureConnected() {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      console.log('Already connected - syncing UI state');
      // Ensure UI state is in sync
      if (this.connectionState() !== ConnectionState.Connected) {
        console.log('UI state was out of sync, updating to Connected');
        this.connectionState.set(ConnectionState.Connected);
        this.connectionError.set('');
        this.startHeartbeat();
        this.rejoinCurrentSession();
      }
      return;
    }

    // If already reconnecting, don't interfere - let automatic reconnect finish
    if (this.hubConnection.state === signalR.HubConnectionState.Reconnecting) {
      console.log('Automatic reconnection already in progress, waiting...');
      return;
    }

    this.connectionState.set(ConnectionState.Connecting);
    console.log('Starting connection...');
    try {
      await this.hubConnection.start();
      console.log('Connection started successfully');
      this.connectionState.set(ConnectionState.Connected);
      this.connectionError.set('');
      this.startHeartbeat();
      // Re-join current session if we have session info
      this.rejoinCurrentSession();
    } catch (err) {
      console.error('Failed to connect to hub:', err);
      this.connectionState.set(ConnectionState.Failed);
      this.connectionError.set(err instanceof Error ? err.message : 'Connection failed');
      throw err;
    }
  }

  // Public method to manually reconnect
  public async reconnect() {
    console.log('Manual reconnect initiated, current state:', this.connectionState(), 'hub state:', this.hubConnection.state);

    // Stop any existing connection first
    try {
      if (this.hubConnection.state !== signalR.HubConnectionState.Disconnected) {
        console.log('Stopping existing connection...');
        await this.hubConnection.stop();
      }
    } catch (err) {
      console.warn('Error stopping connection:', err);
    }

    // Reset state
    this.connectionState.set(ConnectionState.Disconnected);
    this.stopHeartbeat();

    // Attempt fresh connection
    console.log('Starting fresh connection...');
    await this.ensureConnected();
  }

}
