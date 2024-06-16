import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { EventEmitter, Output } from '@angular/core';

import { Budgets, TransactionFilter, TxnSortHeader } from 'app/lib/transactions';
import { DateRangeFilterComponent } from 'app/controls/daterange.component';
import { AccountsFilterComponent } from 'app/controls/account-filter.component';
import { DescriptionFilterComponent } from 'app/controls/description.component';
import { BudgetsFilterComponent } from 'app/controls/budgets-filter.component';
import { Accounts } from 'app/lib/accounts';

@Component({
    selector: 'transaction-filters',
    templateUrl: './txn-filter.component.html',
    standalone: true,
    imports: [
        CommonModule,
        DateRangeFilterComponent,
        AccountsFilterComponent,
        DescriptionFilterComponent,
        BudgetsFilterComponent,
    ],
})
export class TransactionFilterComponent {
    @Input() filter: TransactionFilter;
    @Output() filterChange = new EventEmitter<TransactionFilter>();

    constructor() {
        this.filter = <TransactionFilter>{
            fromDate: new Date(),
            toDate: new Date(),
            description: '',
            budgets: <Budgets>[],
            accounts: [],
            tags: [],
            limit: -1,
            sort: <TxnSortHeader>{ column: 'datePosted', asc: true }
        };
    }

    accounts($event: Accounts): void {
        this.filter.accounts = $event;
        this.filterChange.emit(this.filter);
    }

    budgets($event: Budgets): void {
        this.filter.budgets = $event;
        this.filterChange.emit(this.filter);
    }
}
