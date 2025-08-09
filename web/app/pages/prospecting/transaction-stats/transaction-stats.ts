import { Component, Input } from '@angular/core';
import { Transactions } from 'app/lib/transactions';

@Component({
  selector: 'yaba-txn-stats',
  templateUrl: './transaction-stats.html',
  styleUrls: ['./transaction-stats.css'],
  standalone: false,
})
export class TransactionStatsComponent {
    @Input() transactions: Transactions = new Transactions();
}
