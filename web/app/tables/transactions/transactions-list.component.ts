import { Component, Input, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatChipEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';

import { YabaTxnPaginationComponent } from 'app/controls/controls.component';
import { SortAgent, YabaFilters } from 'app/lib/filters';
import { TransactionHeaders } from 'app/lib/structures';
import { Transactions, EditPlaceholder, Transaction } from 'app/lib/transactions';
import { Account, Accounts } from 'app/lib/accounts';
import { ControlsModule } from 'app/controls/controls.module';
import { SortByTxnHeaderPipe } from 'app/sort-by-txn-header.pipe';

@Component({
  selector: 'yaba-transaction-list',
  templateUrl: './transactions-list.component.html',
  styleUrl: './transactions-list.component.css',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatChipsModule,
    MatIconModule,
    YabaTxnPaginationComponent,
    ControlsModule,
    SortByTxnHeaderPipe,
  ],
})
export class TransactionsListComponent {
  title = 'Transactions';
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  // Data
  txns: Transactions;
  accounts: Accounts;
  // Filtering
  @Input() accountId: string;
  @Input() showDaterange: boolean;
  @Input() showAccounts: boolean;
  @Input() showDescription: boolean;
  @Input() showTags: boolean;
  @Input() fromDate: Date;
  @Input() toDate: Date;
  @Input() selectedAccounts: Account[];
  @Input() description: string|RegExp;
  @Input() useRegexp: boolean;
  @Input() selectedBudgets: string[];
  // Decorators
  @Input() paginate: boolean;
  @Input() txShow?: TransactionHeaders;
  currentlyEditing: EditPlaceholder;
  @Input() editable: boolean;
  @Input() withHeader: boolean;
  @Input() withTags: boolean;
  // Sorting and Ordering
  @Input() sort: SortAgent;
  @Input() limit: number;

  constructor() {
    this.accountId = '';
    this.txns = new Transactions();
    this.sort = { column: 'datePosted', asc: true };
    this.showDaterange = true;
    this.showAccounts = true;
    this.showDescription = true;
    this.showTags = true;
    this.fromDate = new Date(new Date().getTime() - 86400);
    this.toDate = new Date();
    this.selectedAccounts = [];
    this.description = '';
    this.useRegexp = false;
    this.selectedBudgets = [];
    this.paginate = true;
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

  useAccounts(accounts: Account[]|Accounts) {
    this.selectedAccounts = <Accounts>accounts;
  }

  useBudgets(budgets: string[]) {
    this.selectedBudgets = budgets;
  }
}
