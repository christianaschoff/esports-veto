import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { RemoteService } from '../../services/remote.service';
import { LegalNotice } from '../../data/legal.data';

@Component({
  selector: 'app-legal',
  imports: [CommonModule],
  templateUrl: './legal.html',
  styleUrl: './legal.scss'
})
export class Legal implements OnInit {

  breadcrumbService = inject(BreadcrumbService);
  remoteService = inject(RemoteService);
  legalNotice = signal<LegalNotice | null>(null);

  constructor() {
    this.breadcrumbService.addPath([{path: '', displayName: 'Legal Notice'}]);
  }

  ngOnInit(): void {
    this.remoteService.getLegalNotice().then(data => {
      this.legalNotice.set(data);
    }).catch(error => {
      console.error('Failed to load legal notice', error);
    });
  }
}
