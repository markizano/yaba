import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routeConfig } from 'app/routing';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'yaba-menu',
  templateUrl: './menu.component.html',
  standalone: true,
  imports: [
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
})
export class MenuComponent {
    public routes = routeConfig;
}
