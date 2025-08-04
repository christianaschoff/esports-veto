import { Component, inject, signal } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AnimationStyle, Size } from '../../data/oberserver.data';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ObserverStore } from '../../store/store';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-observe-settings-popup',
  imports: [ MatButtonModule, MatIconModule, MatButtonToggleModule, MatSlideToggleModule, FormsModule],
  templateUrl: './observe-settings-popup.html',
  styleUrl: './observe-settings-popup.scss'
})
export class ObserveSettingsPopup {
  AnimationStyle = AnimationStyle;
  Size = Size;
  dialogRef = inject<DialogRef>(DialogRef); 
  osState = inject(ObserverStore);


  setAnimationStyle($event: AnimationStyle) {
    this.osState.updateAnimationDirection($event)
  }
  
  setSize($event: Size) {  
    this.osState.updateSize($event);
  }
  setBorder($event: boolean) {
    this.osState.updateShowborder($event);
  }
  setVetoInfo($event: boolean) {
    this.osState.updateShowVetoInfo($event);
  }  

  setFullscreen($event: boolean) {
    this.osState.updateFullscreen($event);
  }  

  setSaveLocally($event: boolean) {
    this.osState.updateStoreLocally($event);
  }  

  setLivePreview($event: boolean) {
    this.osState.updateLivePreview($event);
  }
  closeSettings() {
    this.dialogRef.close();
  }
}
