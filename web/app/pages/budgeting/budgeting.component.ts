import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Account, Accounts } from 'app/lib/accounts';
import { BudgetStruct } from 'app/lib/structures';
import { Transactions } from 'app/lib/transactions';

@Component({
  selector: 'yaba-budgeting',
  templateUrl: './budgeting.component.html',
})
export class BudgetingComponent {
  @Input() fromDate: Date;
  @Input() toDate: Date;
  @Input() selectedAccounts: Account[]|Accounts;
  @Input() description: string|RegExp;
  @Input() txns: Transactions;
  @Input() budgets: BudgetStruct[] = [];
  error = '';
  @Output() fromDateChange = new EventEmitter<Date>();
  @Output() toDateChange = new EventEmitter<Date>();
  @Output() descriptionChange = new EventEmitter<string|RegExp>();

  constructor() {
    this.txns = new Transactions();
    this.fromDate = new Date();
    this.toDate = new Date();
    this.selectedAccounts = [];
    this.description = '';
  }
}
