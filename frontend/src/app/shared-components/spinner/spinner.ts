import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GlobalStore } from "../../store/global-store";

@Component({
  selector: 'app-spinner',
  imports: [MatProgressSpinnerModule],
  templateUrl: './spinner.html',
  styleUrl: './spinner.scss'
})
export class Spinner {
  globalState = inject(GlobalStore);  
  
}
