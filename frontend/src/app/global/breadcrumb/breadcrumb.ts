import { Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { ConnectionStatus } from "../../shared-components/connection-status/connection-status";

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterModule, ConnectionStatus],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.scss'
})
export class Breadcrumb {

  data = computed(() => {
    return this.breadcrumbService.breadcrumb();        
  }  
 );

 isConnectionVisible = computed(() => {
  var result = this.data().find(x => x.path === '/veto' || x.path === '/observe');
  return result ? true : false;
 });

  constructor(readonly breadcrumbService: BreadcrumbService) {    
  } 
}
