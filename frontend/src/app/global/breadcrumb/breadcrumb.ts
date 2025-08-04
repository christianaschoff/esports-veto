import { Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BreadcrumbService } from '../../services/breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterModule],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.scss'
})
export class Breadcrumb {

  data = computed(() => {
    return this.breadcrumbService.breadcrumb();        
  }  
 );
  constructor(readonly breadcrumbService: BreadcrumbService) {    
  }    
}
