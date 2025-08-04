import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { BreadcrumbService } from '../../services/breadcrumb.service';


export enum HOMETYPE {
  NEW = 'NEW',
  VETO = 'VETO'
};

@Component({
  selector: 'app-home-ui',
  imports: [RouterModule, MatCardModule, MatButtonModule],
  templateUrl: './home-ui.html',
  styleUrl: './home-ui.scss'
})
export class HomeUi implements OnInit {

  hometype = HOMETYPE;
  breadcrumbService = inject(BreadcrumbService);
  constructor(private readonly router: Router) {

  }
  ngOnInit(): void {
    this.breadcrumbService.addPath([]);
  }

  onSelect(hometype: HOMETYPE) {
    if(hometype === HOMETYPE.VETO) {
      this.router.navigate(['/veto']);      
      return;
    }
    else if(hometype === HOMETYPE.NEW) {
      this.router.navigate(['/new']);
      return;
    }    
    this.router.navigate(['/']);
  }

}
