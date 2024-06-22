import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { EventEmitter, Output } from '@angular/core';

import { Budgets, EMPTY_TRANSACTION_FILTER, TransactionFilter, Transactions } from 'app/lib/transactions';
import { DateRangeFilterComponent } from 'app/controls/daterange.component';
import { AccountsFilterComponent } from 'app/controls/account-filter.component';
import { DescriptionFilterComponent } from 'app/controls/description.component';
import { BudgetsFilterComponent } from 'app/controls/budgets-filter.component';
import { Accounts } from 'app/lib/accounts';
import { DateRange, Description } from 'app/lib/types';

/**
 * This is a glue component that combines the various filters into a single component
 * and joins their events into a single handler.
 * 
 * In this way, you can <transaction-filters> and have a single event handler for all the filters.
 * Each time a filter component changes, the filter object will also change and allow subscriptions
 * to changes.
 * 
 * @Input/@Output {TransactionFilter} filter - The filter object to be updated by the filters.
 * @Input {Transactions} transactions - The list of transactions after filtering. This is used
 *    to determine the list of budgets and accounts to display in the filters.
 */
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
    @Input() transactions: Transactions;
    filterByAccount: boolean;

    constructor() {
        this.transactions = new Transactions();
        this.filter = EMPTY_TRANSACTION_FILTER;
        this.filter.description = '';
        this.filterByAccount = this.filter.accounts !== undefined;
        this.filterChange.subscribe((filter: TransactionFilter) => {
            this.filterByAccount = filter.accounts !== undefined;
        });
    }

    daterange(dr: DateRange) {
        this.filter.fromDate = new Date(dr.fromDate);
        this.filter.toDate = new Date(dr.toDate);
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
