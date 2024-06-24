import { Component, EventEmitter, Input, Output } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatChipEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';

import { Id2NameHashMap, TransactionShowHeaders } from 'app/lib/types';
import { Transactions, EditPlaceholder, Transaction, TransactionFilter, TransactionFields, EMPTY_TRANSACTION_FILTER, TxnSortHeader } from 'app/lib/transactions';

import { AccountsService } from 'app/services/accounts.service';
import { ControlsModule } from 'app/controls/controls.module';
import { TxnEditDirective } from 'app/tables/transactions/txn-edit.directive';
import { TransactionFilterComponent } from 'app/controls/txn-filter.component';
import { Accounts } from 'app/lib/accounts';
import { Subscription } from 'rxjs';
import { Settings } from 'app/lib/settings';

@Component({
    selector: 'yaba-transaction-list',
    templateUrl: './transactions-list.component.html',
    standalone: true,
    imports: [
        MatChipsModule,
        MatIconModule,
        ControlsModule,
        TransactionFilterComponent,
        TxnEditDirective,
        MatPaginatorModule,
    ],
})
export class TransactionsListComponent {
    addOnBlur = true;
    readonly separatorKeysCodes = [ENTER, COMMA] as const;
    // Data
    #transactions = new Transactions();
    @Input() get transactions(): Transactions {
        return this.#transactions;
    }
    set transactions(value: Transactions) {
        this.#transactions = value;
        this.refresh();
    }
    @Output() transactionsChange = new EventEmitter<Transactions>();

    // Filtering
    @Input() showFilters = true;

    @Input() filters = EMPTY_TRANSACTION_FILTER;
    @Output() filtersChange = new EventEmitter<TransactionFilter>();

    // Decorators
    @Input() showPaginate = true;
    @Input() truncate = false;
    txShow: TransactionShowHeaders;

    @Input() editable = false;
    @Input() showHeader = true;
    @Input() showTags = true;

    currentlyEditing = <EditPlaceholder>{
        datePending: false,
        datePosted: false,
        amount: false,
        description: false,
        merchant: false,
        transactionType: false,
        tags: false,
    };
    txns = new Transactions();
    accountId2name = <Id2NameHashMap>{};

    #oldTxnLen = 0;
    #cachedUpdates?: Subscription;

    constructor(protected accountsService: AccountsService) {
        console.log('new TransactionsListComponent()');
        this.transactionsChange.subscribe(() => this.refresh());
        this.filtersChange.subscribe(() => this.refresh());
        this.txShow = Settings.fromLocalStorage().txShow;
    }

    ngOnInit(): void {
        console.log('TransactionsListComponent().ngOnInit()');
        console.debug(this.transactions);
        const update = (acts: Accounts) => {
            this.accountId2name = new Accounts(...acts).reduce((acc, x) => {
                acc[x.id] = x.name;
                return acc;
            }, <Id2NameHashMap>{});
        };
        update(this.accountsService.get());
        this.#cachedUpdates = this.accountsService.subscribe(update);
    }

    ngDoCheck() {
        if (this.transactions.length != this.#oldTxnLen) {
            this.#oldTxnLen = this.transactions.length;
            this.transactionsChange.emit(this.transactions);
        }
    }

    ngOnDestroy() {
        this.#cachedUpdates?.unsubscribe();
    }

    /**
     * I know there's a more efficient way of doing this, but I'm not sure how to refresh only updated
     * records rather than iterating over the array again with the filter set.
     */
    refresh() {
        console.log('TransactionListComponent().refresh()');
        this.txns = new Transactions(...this.transactions.getTransactions(this.filters));
        console.debug({filters: this.filters, transactions: this.transactions, txns: this.txns});
    }

    filtation(filters: TransactionFilter): string {
        return JSON.stringify({
            fromDate: filters.fromDate,
            toDate: filters.toDate,
            description: filters.description,
            budgets: filters.budgets,
            accounts: filters.accounts?.map(x => ({id: x.id, name: x.name})),
            tags: filters.tags,
            sort: filters.sort,
            page: filters.page,
        });
    }

    sortBy(header: TransactionFields): void {
        const sortAgent = <TxnSortHeader>{
            asc: this.filters.sort.column == header? !this.filters.sort.asc: true,
            column: header,
        };
        this.filters.sort = sortAgent;
        this.filtersChange.emit(this.filters);
    }

    removeTag(txn: Transaction, $event: MatChipEvent): void {
        txn.removeTag($event.chip.value);
    }


    addTag(txn: Transaction, $event: MatChipInputEvent) {
        return txn.addTag($event.value);
    }

    turnPage($event: PageEvent) {
        console.log('page turned:', $event);
        this.filters.page = $event;
        this.filtersChange.emit(this.filters);
        this.refresh();
    }
}
