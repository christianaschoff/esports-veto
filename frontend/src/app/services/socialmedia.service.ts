import { inject, Injectable } from '@angular/core';
import { RemoteService } from './remote.service';
import { Meta } from '@angular/platform-browser';
import { SocialMediaData } from '../data/socialmedia.data';

@Injectable({
  providedIn: 'root'
})
export class SocialmediaService {

  private remoteService = inject(RemoteService);  
  constructor(private meta: Meta) {}

  async updateMetaTags(role: string, id: string) {
    const result = await this.remoteService.getSocialMediaInformation(role, id);
    if(result) {
      this.updateMeta(result);
    } else {
      this.fallbackMetaTags();
    }
  }

  private updateMeta(data: SocialMediaData) {
    this.meta.updateTag({property: 'og:title', content: data.title });
    this.meta.updateTag({property: 'og:description', content: data.description });
    this.meta.updateTag({property: 'og:author', content: data.author });
    this.meta.updateTag({ property: 'og:image', content: 'images/socialmedia.png' });

    this.meta.updateTag({name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({name: 'twitter:title', content: data.title });
    this.meta.updateTag({name: 'twitter:description',content: data.description });
    this.meta.updateTag({name: 'twitter:author',content: data.author });
    this.meta.updateTag({ name: 'twitter:image', content: 'images/socialmedia.png' });
  }
  fallbackMetaTags() {    
    this.meta.updateTag({ property: 'og:title', content: 'Veto by ODGW' });
    this.meta.updateTag({ property: 'og:description', content: 'Your Esports Veto Platform' });
    this.meta.updateTag({ property: 'og:image', content: 'images/socialmedia.png' });
    this.meta.updateTag({ name: 'twitter:image', content: 'images/socialmedia.png' });    
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
  }
}
