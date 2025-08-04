import { Injectable, signal, WritableSignal } from '@angular/core';
import { Breadcrumb } from '../data/breadcrumb.data';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {

  public breadcrumb: WritableSignal<Breadcrumb[]> = signal([]);
  constructor() { }

  addPath(breadcrumb: Breadcrumb[]) {
    this.breadcrumb.set(breadcrumb);
  }  
}
