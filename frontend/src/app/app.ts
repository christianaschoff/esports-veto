import { Component, computed, effect, inject, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Breadcrumb } from './global/breadcrumb/breadcrumb';
import { TopBar } from "./global/top-bar/top-bar";
import { Footer } from './global/footer/footer';
import { ObserverStore } from './store/observer-store';
import { GlobalStore } from "./store/global-store";
import { BetaMarker } from './global/beta-marker/beta-marker';
import { Spinner } from "./shared-components/spinner/spinner";
import { SocialmediaService } from './services/socialmedia.service';
import { SeasonsAndMapsStore } from './store/seasons-maps-store';
import { GameModes } from './data/gamemodes.data';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Breadcrumb, TopBar, Footer, BetaMarker, Spinner],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'Esports Veto made easy';  //Choose your map. Own your match.
  private obState = inject(ObserverStore);
  private globalState = inject(GlobalStore);
  private seasonAndMapsState = inject(SeasonsAndMapsStore);
  private socialmediaService = inject(SocialmediaService);

  fullscreenMode = computed(() => {
    return this.globalState.observerViewActive() && this.obState.fullscreen();
  });

  constructor() {    
    this.obState.loadFromStorage();
    this.socialmediaService.fallbackMetaTags();
    this.seasonAndMapsState.loadSeasons();
    
    effect(() => {
      if(!this.globalState.isLoading()) {
        document.body.classList.remove('no-scroll');
      } else {
        document.body.classList.add('no-scroll');
      }
    });

  }  
}
