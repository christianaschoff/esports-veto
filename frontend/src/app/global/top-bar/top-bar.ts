import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  imports: [RouterModule],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss'
})
export class TopBar {

    router = inject(Router);

    navigateTo(destination: string) {
      this.router.navigateByUrl(destination);
    }
}
