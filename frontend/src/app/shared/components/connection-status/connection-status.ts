import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SignalrService, ConnectionState } from '../../../services/signalr.service';

@Component({
  selector: 'app-connection-status',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './connection-status.html',
  styleUrl: './connection-status.scss'
})
export class ConnectionStatus {

  signalrService = inject(SignalrService);

  // Computed signals for UI state
  isConnected = computed(() => this.signalrService.connectionState() === ConnectionState.Connected);
  isReconnecting = computed(() => this.signalrService.connectionState() === ConnectionState.Reconnecting);
  isDisconnected = computed(() => this.signalrService.connectionState() === ConnectionState.Disconnected);
  isFailed = computed(() => this.signalrService.connectionState() === ConnectionState.Failed);
  hasError = computed(() => !!this.signalrService.connectionError());

  // Status text
  statusText = computed(() => {
    switch (this.signalrService.connectionState()) {
      case ConnectionState.Connected:
        return 'Connected';
      case ConnectionState.Reconnecting:
        return 'Reconnecting...';
      case ConnectionState.Disconnected:
        return 'Disconnected';
      case ConnectionState.Failed:
        return 'Connection Failed';
      default:
        return 'Connecting...';
    }
  });

  // Status icon
  statusIcon = computed(() => {
    switch (this.signalrService.connectionState()) {
      case ConnectionState.Connected:
        return 'wifi';
      case ConnectionState.Reconnecting:
        return 'sync';
      case ConnectionState.Disconnected:
      case ConnectionState.Failed:
        return 'wifi_off';
      default:
        return 'sync';
    }
  });

  async retryConnection() {
    try {
      await this.signalrService.reconnect();
    } catch (error) {
      console.error('Manual reconnection failed:', error);
    }
  }

}