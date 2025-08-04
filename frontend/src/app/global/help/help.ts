import { Component, inject } from '@angular/core';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-help',
  imports: [MatIconModule],
  templateUrl: './help.html',
  styleUrl: './help.scss'
})
export class Help {
  breadcrumbService = inject(BreadcrumbService);
  constructor() {
    this.breadcrumbService.addPath([{path: '', displayName: 'Help'}]);
  }
}
