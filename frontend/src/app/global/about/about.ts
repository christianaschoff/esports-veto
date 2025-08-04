import { Component, inject } from '@angular/core';
import { BreadcrumbService } from '../../services/breadcrumb.service';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {

  breadcrumbService = inject(BreadcrumbService);
  constructor() {
    this.breadcrumbService.addPath([{path: '', displayName: 'About'}]);
  }
}
