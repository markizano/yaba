import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routeConfig } from 'app/routing';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Observable, fromEvent, map, startWith, throttleTime } from 'rxjs';

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
    isScreenSmall$: Observable<boolean> = new Observable<boolean>();
    isScreenSmall = false;

    ngOnInit(): void {
        // Checks if screen size is less than 768 pixels
        const checkScreenSize = () => this.isScreenSmall = document.body.offsetWidth < 768;
      
        // Create observable from window resize event throttled so only fires every 500ms
        const screenSizeChanged$ = fromEvent(window, 'resize').pipe(throttleTime(500), map(checkScreenSize));
      
        // Start off with the initial value use the isScreenSmall$ | async in the
        // view to get both the original value and the new value after resize.
        this.isScreenSmall$ = screenSizeChanged$.pipe(startWith(checkScreenSize()))
      }

}
