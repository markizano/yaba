import { Component, Input } from '@angular/core';
import { ControlsModule } from 'app/controls/controls.module';
import { Transactions } from 'app/lib/transactions';

@Component({
  selector: 'yaba-txn-stats',
  imports: [
    ControlsModule
  ],
  templateUrl: './txn-stats.html',
  styleUrls: ['./txn-stats.css']
})
export class TxnStatsComponent {
    @Input() transactions: Transactions = new Transactions();
}
