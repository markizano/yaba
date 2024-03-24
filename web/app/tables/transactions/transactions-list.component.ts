import { Component } from '@angular/core';
import { MatChipEvent, MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { Transactions, EditPlaceholder, Transaction } from 'app/lib/transactions';
import { TransactionHeaders } from 'app/lib/structures';
import { SortAgent, YabaFilters } from 'app/lib/filters';
import { Accounts } from 'app/lib/accounts';

@Component({
  selector: 'yaba-transaction-list',
  templateUrl: './transactions-list.component.html',
  styleUrl: './transactions-list.component.css'
})
export class TransactionsListComponent {
  title = 'Transactions';
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  // Data
  txns: Transactions;
  accounts: Accounts;
  // Decorators
  txShow?: TransactionHeaders;
  currentlyEditing: EditPlaceholder;
  editable: boolean;
  withHeader: boolean;
  withTags: boolean;
  // Sorting and Ordering
  sort: SortAgent;
  limit: number;

  constructor() {
    this.txns = new Transactions();
    this.sort = { column: 'datePosted', asc: true };
    this.withHeader = true;
    this.withTags = true;
    this.limit = 1000;
    this.editable = false;
    this.currentlyEditing = {
      datePending: false,
      datePosted: false,
      amount: false,
      description: false,
      merchant: false,
      transactionType: false,
      tags: false,
    };
    this.accounts = new Accounts();
  }

  sortBy(header: string) {
    this.sort.column = header;
    return YabaFilters.sortBy(this.sort);
  }

  removeTag(txn: Transaction, $event: MatChipEvent) {
    return txn.removeTag($event.chip.value);
  }

  save() {
    // @TODO: access storables and store to disk.
  }

  addTag(txn: Transaction, $event: MatChipInputEvent) {
    return txn.addTag($event.value);
  }
}
