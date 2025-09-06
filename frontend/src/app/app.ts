import { Component, computed, effect, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Breadcrumb } from './global/breadcrumb/breadcrumb';
import { TopBar } from "./global/top-bar/top-bar";
import { Footer } from './global/footer/footer';
import { GlobalStore, ObserverStore } from './store/store';
import { BetaMarker } from './global/beta-marker/beta-marker';
import { Spinner } from "./shared-components/spinner/spinner";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Breadcrumb, TopBar, Footer, BetaMarker, Spinner],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'Esports Veto made easy';  
  obState = inject(ObserverStore);
  globalState = inject(GlobalStore);

  fullscreenMode = computed(() => {
    return this.globalState.observerViewActive() && this.obState.fullscreen();
  });

  constructor() {    
    this.obState.loadFromStorage();    
    effect(() => {
      if(!this.globalState.isLoading()) {
        document.body.classList.remove('no-scroll');
      } else {
        document.body.classList.add('no-scroll');
      }
    });
  }  
}
