import { Component, Input } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { GameData } from '../../data/game-data.data';
import { Router } from '@angular/router';
import { BreadcrumbService } from '../../services/breadcrumb.service';

@Component({
  selector: 'app-game-card',
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './game-card.html',
  styleUrl: './game-card.scss'
})
export class GameCard {

  @Input() game?: GameData;
  constructor(private readonly router: Router, private readonly breadcrumbService: BreadcrumbService) {
    
  }

  onSelect() {
    if(this.game?.isActive) {
      this.router.navigate(['/new', this.game?.id]);    
    }
  }

}
