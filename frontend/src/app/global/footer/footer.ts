import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GlobalStore } from '../../store/store';
import { RemoteService } from '../../services/remote.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  
  globalStore = inject(GlobalStore);
  remoteService = inject(RemoteService);
  sinceInfo = computed(() => { // does not need to be a signal, but we need to get used to it
    const now = new Date();
    const currentYear =  now.getFullYear();
    return currentYear > 2025 ? `2025 - ${currentYear}` : `${currentYear}`;
  });

  constructor() {
    effect( // it is not important when this is loaded...
      async () => {
        if(this.globalStore.version() === '') {
          const version = await this.remoteService.versionInfo();
          this.globalStore.setVersion(version);
        }
      }
    );
  }
}
