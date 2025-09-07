import { Component, Inject, inject, OnInit, signal } from '@angular/core';
import { MatProgressBarModule} from '@angular/material/progress-bar';
import { CdkDialogContainer, DIALOG_DATA, DialogModule, DialogRef,  } from '@angular/cdk/dialog';
import { FormsModule } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DialogData {
  mapname: string;
  mapimage: string;
  isVeto: boolean;
}

@Component({
  selector: 'app-veto-popup',
  imports: [MatProgressBarModule, FormsModule, DialogModule, NgOptimizedImage, MatButtonModule, MatIconModule],
  templateUrl: './veto-popup.html',
  styleUrl: './veto-popup.scss'
})
export class VetoPopup extends CdkDialogContainer implements OnInit  {  
  dialogRef = inject<DialogRef<boolean>>(DialogRef<boolean>);  
  value = signal(100);
  
  constructor(@Inject(DIALOG_DATA) public data: DialogData) {
    super();    
  }
  ngOnInit(): void {      
    setTimeout(() => this.timoutBeforePropagation(), 500);
  }

  timoutBeforePropagation() {
      const timer = setInterval(() => {
        this.value.set(this.value() - 2); 
        if(this.value() <= 0) {
           setTimeout(() => this.dialogRef.close(true), 500);
           this.value.set(0);
           clearInterval(timer);
        }
      }, 35);
    }

  cancelPick() {
    this.dialogRef.close(false);    
  }
}
