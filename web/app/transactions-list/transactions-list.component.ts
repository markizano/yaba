import { Component } from '@angular/core';
import { Transactions } from 'app/lib/transactions';
import { ShowTransactions } from 'app/lib/structures';

@Component({
  selector: 'yaba-transaction-list',
  templateUrl: './transactions-list.component.html',
  styleUrl: './transactions-list.component.css'
})
export class TransactionsListComponent {
  title = 'Transactions';
  txns: Transactions;
  txShow?: ShowTransactions;

  constructor() {
    this.txns = new Transactions();
  }
}
