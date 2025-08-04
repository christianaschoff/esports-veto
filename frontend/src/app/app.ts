import { Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet, UrlSegment } from '@angular/router';
import { Breadcrumb } from './global/breadcrumb/breadcrumb';
import { TopBar } from "./global/top-bar/top-bar";
import { Footer } from './global/footer/footer';
import { environment } from '../environments/environment';
import { GlobalStore, ObserverStore } from './store/store';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Breadcrumb, TopBar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'E-Sports Veto made easy';  
  obState = inject(ObserverStore);
  globalState = inject(GlobalStore);

  fullscreenMode = computed(() => {
    return this.globalState.observerViewActive() && this.obState.fullscreen();
  });

  constructor() {
    console.log('isProdBuild', environment.production);
    this.obState.loadFromStorage();    
  }  
}
