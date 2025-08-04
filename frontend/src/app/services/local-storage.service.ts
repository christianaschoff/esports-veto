import { Injectable } from '@angular/core';
import { OberserverConfig } from '../data/oberserver.data';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  obs = 'oberserver';

  constructor() { }
  save(config: OberserverConfig) {
    localStorage.setItem(this.obs, JSON.stringify(config));
  }

  remove() {
    localStorage.removeItem(this.obs);
  }

  load() : OberserverConfig | undefined {
    const data = localStorage.getItem(this.obs);    
    if(data) {
      const parsed = JSON.parse(data);
      return parsed ?? undefined;
    }
    return undefined;
  }
}
