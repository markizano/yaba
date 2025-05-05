import { Component, Input } from '@angular/core';
import { ControlsModule } from 'app/controls/controls.module';
import { Transactions } from 'app/lib/transactions';

@Component({
  selector: 'yaba-wishlist',
  standalone: true,
  imports: [
    ControlsModule,
  ],
  templateUrl: './wishlist.component.html',
})
export class WishlistComponent {
    @Input()
    wishlist: Transactions = new Transactions();
}
