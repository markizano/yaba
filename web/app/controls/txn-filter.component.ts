import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { EventEmitter, Output } from '@angular/core';

import { Account, Accounts } from 'app/lib/accounts';
import { Transactions } from 'app/lib/transactions';
import { YabaFilterDateRangeComponent } from 'app/controls/daterange.component';
import { YabaFilterAccountsComponent } from 'app/controls/account-filter.component';
import { YabaFilterDescriptionComponent } from 'app/controls/description.component';
import { YabaFilterBudgetsComponent } from 'app/controls/budgets-filter.component';

@Component({
    selector: 'transaction-filters',
    templateUrl: './txn-filter.component.html',
    standalone: true,
    imports: [
        CommonModule,
        YabaFilterDateRangeComponent,
        YabaFilterAccountsComponent,
        YabaFilterDescriptionComponent,
        YabaFilterBudgetsComponent,
    ],
})
export class TransactionFilterComponent {
    title = 'Transaction Filters';
    @Input() showDaterange: boolean;
    @Input() showAccounts: boolean;
    @Input() showDescription: boolean;
    @Input() showTags: boolean;
    @Input() txns: Transactions;
    @Input() accounts: Accounts;
    @Input() fromDate: Date;
    @Input() toDate: Date;
    @Input() description: string|RegExp;
    @Input() budgets: string[];
    @Output() fromDateChange = new EventEmitter<Date>();
    @Output() toDateChange = new EventEmitter<Date>();
    @Output() descriptionChange = new EventEmitter<string|RegExp>();
    @Output() selectedBudgets = new EventEmitter<string[]>();
    @Output() selectedAccounts = new EventEmitter<Account[]|Accounts>();

    constructor() {
        this.showDaterange = true;
        this.showAccounts = true;
        this.showDescription = true;
        this.showTags = true;
        this.txns = new Transactions();
        this.accounts = new Accounts();
        this.fromDate = new Date();
        this.toDate = new Date();
        this.description = '';
        this.budgets = [];
    }

    useAccounts(accounts: Account[]) {
        this.selectedAccounts.emit(accounts);
    }

    useBudgets(budgets: string[]) {
        this.selectedBudgets.emit(budgets);
    }
}
