import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { EventEmitter, Output } from '@angular/core';

import { DateRange, DescriptionChange, Budgets, TransactionFilter, Tags } from 'app/lib/types';
import { EMPTY_TRANSACTION_FILTER } from 'app/lib/constants';
import { Transaction, Transactions } from 'app/lib/transactions';
import { Accounts } from 'app/lib/accounts';
import { DateRangeFilterComponent } from 'app/controls/daterange.component';
import { AccountsFilterComponent } from 'app/controls/account-filter.component';
import { DescriptionFilterComponent } from 'app/controls/description.component';
import { TagsFilterComponent } from 'app/controls/tags-filter.component';

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
        TagsFilterComponent,
    ],
})
export class TransactionFilterComponent {
    @Input() filter = EMPTY_TRANSACTION_FILTER;
    @Output() filterChange = new EventEmitter<TransactionFilter>();
    @Input() transactions = new Transactions();
    @Output() filteredTransactions = new EventEmitter<Transactions>();
    filterByAccount: boolean;
    tags: Tags = [];

    constructor() {
        this.filter.description = '';
        this.filter.tags = [];
        this.filterByAccount = this.filter.accounts !== undefined;
        this.filterChange.subscribe((filter: TransactionFilter) => {
            this.filterByAccount = filter.accounts !== undefined;
            this.filteredTransactions.emit(this.transactions.search((txn: Transaction) => this.transactions.searchTransaction(filter, txn)));
        });
        this.filterChange.emit(this.filter);
        this.filteredTransactions.subscribe((txns: Transactions) => this.tags = txns.getTags());
    }

    ngOnInit() {
        this.filteredTransactions.emit(this.transactions.search((txn: Transaction) => this.transactions.searchTransaction(this.filter, txn)));
        console.log('TransactionFilterComponent().ngOnInit()', this.transactions.length);
    }

    daterange($event: DateRange) {
        this.filter.fromDate = new Date($event.fromDate);
        this.filter.toDate = new Date($event.toDate);
        this.filterChange.emit(this.filter);
    }

    accounts($event: Accounts): void {
        this.filter.accounts = $event;
        this.filterChange.emit(this.filter);
    }

    budgets($event: Tags): void {
        this.filter.tags = $event;
        this.filterChange.emit(this.filter);
    }

    description($event: DescriptionChange) {
        this.filter.description = $event.useRegexp ? new RegExp($event.description) : $event.description;
        console.debug('description', this.filter.description);
        this.filterChange.emit(this.filter);
    }
}
