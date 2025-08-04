import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-copyright',
  imports: [],
  templateUrl: './copyright.html',
  styleUrl: './copyright.scss'
})
export class Copyright {

 @Input() gameId: string = '';

}
