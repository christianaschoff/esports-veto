import { Injectable } from '@angular/core';
import { ObserverConfig } from '../data/observer.data';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  obs = 'observer';

  constructor() { }
  save(config: ObserverConfig) {
    localStorage.setItem(this.obs, JSON.stringify(config));
  }

  remove() {
    localStorage.removeItem(this.obs);
  }

  load() : ObserverConfig | undefined {
    const data = localStorage.getItem(this.obs);    
    if(data) {
      const parsed = JSON.parse(data);
      return parsed ?? undefined;
    }
    return undefined;
  }
}
