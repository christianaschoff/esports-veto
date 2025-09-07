import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { GameData } from '../../data/game-data.data';
import { CommonModule } from '@angular/common';
import { GamesService } from '../../services/games.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { GameCard } from './components/game-card/game-card';

@Component({
  selector: 'app-create-ui',
  imports: [GameCard, CommonModule],
  templateUrl: './create-ui.html',
  styleUrl: './create-ui.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUi implements OnInit {

  public allGames: Array<GameData> = [];

  constructor(private readonly gamesService: GamesService, 
    private readonly breadcrumbService: BreadcrumbService,
  ) {
    this.allGames = this.gamesService.getData();    
  }
  ngOnInit(): void {
    this.breadcrumbService.addPath([{ path: '/new', displayName: 'New' }]);
  }
}
