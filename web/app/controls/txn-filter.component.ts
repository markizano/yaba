import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { EventEmitter, Output } from '@angular/core';

import { Budgets, EMPTY_TRANSACTION_FILTER, TransactionFilter } from 'app/lib/transactions';
import { DateRangeFilterComponent } from 'app/controls/daterange.component';
import { AccountsFilterComponent } from 'app/controls/account-filter.component';
import { DescriptionFilterComponent } from 'app/controls/description.component';
import { BudgetsFilterComponent } from 'app/controls/budgets-filter.component';
import { Accounts } from 'app/lib/accounts';
import { DateRange, Description } from 'app/lib/types';

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
    filterByAccount: boolean;

    constructor() {
        this.filter = EMPTY_TRANSACTION_FILTER;
        this.filterByAccount = this.filter.accounts !== undefined;
        this.filterChange.subscribe((filter: TransactionFilter) => {
            this.filterByAccount = filter.accounts !== undefined;
        });
    }

    daterange(dr: DateRange) {
        this.filter.fromDate = new Date(dr.fromDate);
        this.filter.toDate = new Date(dr.toDate);
        console.log('TransactionFilterComponent().daterange()', this.filter.fromDate, this.filter.toDate);
        this.filterChange.emit(this.filter);
    }

    accounts($event: Accounts): void {
        this.filter.accounts = $event;
        this.filterChange.emit(this.filter);
    }

    budgets($event: Budgets): void {
        this.filter.budgets = $event;
        this.filterChange.emit(this.filter);
    }

    description($event: Description) {
        this.filter.description = $event;
        this.filterChange.emit(this.filter);
    }
}
