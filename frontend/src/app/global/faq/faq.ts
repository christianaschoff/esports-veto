import { Component, inject } from '@angular/core';
import { BreadcrumbService } from '../../services/breadcrumb.service';

@Component({
  selector: 'app-faq',
  imports: [],
  templateUrl: './faq.html',
  styleUrl: './faq.scss'
})
export class Faq {

  breadcrumbService = inject(BreadcrumbService);
  constructor() {
    this.breadcrumbService.addPath([{path: '', displayName: 'FAQ'}]);
  }

}
