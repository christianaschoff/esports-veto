import { Component, inject } from '@angular/core';
import { BreadcrumbService } from '../../services/breadcrumb.service';

@Component({
  selector: 'app-legal',
  imports: [],
  templateUrl: './legal.html',
  styleUrl: './legal.scss'
})
export class Legal {

  breadcrumbService = inject(BreadcrumbService);
  constructor() {
    this.breadcrumbService.addPath([{path: '', displayName: 'Legal Notice'}]);
  }
}
