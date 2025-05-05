import { Component, Input } from '@angular/core';
import { ControlsModule } from 'app/controls/controls.module';
import { Transactions } from 'app/lib/transactions';

@Component({
  selector: 'yaba-txn-stats',
  standalone: true,
  imports: [
    ControlsModule
  ],
  templateUrl: './txn-stats.component.html',
  styleUrl: './txn-stats.component.css'
})
export class TxnStatsComponent {
    @Input() transactions: Transactions = new Transactions();
}
