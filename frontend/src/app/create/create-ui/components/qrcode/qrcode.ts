import { Component, computed, DOCUMENT, Inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SafeUrl } from '@angular/platform-browser';
import { QRCodeComponent } from 'angularx-qrcode';
import {Location} from '@angular/common';
import { ATTENDEE_TYPE } from '../../../../data/veto-constellation.data';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatDividerModule } from '@angular/material/divider';
import { sanitize } from "sanitize-filename-ts";

@Component({
  selector: 'app-qrcode',
  imports: [QRCodeComponent, MatDividerModule, MatButtonModule, MatIconModule, ClipboardModule],
  providers:[Location],
  templateUrl: './qrcode.html',
  styleUrl: './qrcode.scss'
})
export class Qrcode {

  isValid = computed(() => {
    return this.data() 
    && this.data() != '' 
    && this.title() 
    && this.title() != '';
  });

  url = computed(() => {
    if(this.isValid()) {
      var subroute = '';
      switch(this.type()) {
        case ATTENDEE_TYPE.ADMIN: 
          subroute = 'admin';
          break;
        case ATTENDEE_TYPE.OBSERVER: 
          subroute = 'observe';
          break;
        case ATTENDEE_TYPE.PLAYER: 
          subroute = 'veto/player';
          break;
        }

      return document.location.protocol +'//'+ document.location.hostname + (document.location.port ? ':' : '') + document.location.port + '/' + subroute + '/' + this.data();
    }
    return '';
  });

  data = input.required<string>();
  title = input<string>();
  type = input<ATTENDEE_TYPE>();
  
  titleSanitized = computed(() => {
    return sanitize(this.title() ?? '');
  })

  QRCODE_STYLE = ATTENDEE_TYPE;
  public qrCodeDownloadLink: SafeUrl = "";  

  constructor(@Inject(DOCUMENT) private document: Document) {

  }

  onChangeURL(url: SafeUrl) {
    this.qrCodeDownloadLink = url;
  }

}
