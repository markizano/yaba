import { Component, EventEmitter, Input, Output } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatChipEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';

import { Id2NameHashMap, TransactionShowHeaders } from 'app/lib/types';
import { Transactions, Transaction, TransactionFilter, TransactionFields, EMPTY_TRANSACTION_FILTER, TxnSortHeader, Budgets } from 'app/lib/transactions';

import { AccountsService } from 'app/services/accounts.service';
import { ControlsModule } from 'app/controls/controls.module';
import { TransactionFilterComponent } from 'app/controls/txn-filter.component';
import { Accounts } from 'app/lib/accounts';
import { Subscription } from 'rxjs';
import { Settings } from 'app/lib/settings';
import { TxnRowComponent } from './txn-row/txn-row.component';

/**
 * This component is a table that displays transactions. It can be filtered, sorted, and paginated.
 * 
 * @example
 * <yaba-transaction-list [transactions]="transactions" [filters]="filters" [showFilters]="true" [showPaginate]="true" [editable]="true" [showTags]="true"></yaba-transaction-list>
 */
@Component({
    selector: 'yaba-transaction-list',
    templateUrl: './transactions-list.component.html',
    standalone: true,
    imports: [
        MatChipsModule,
        MatIconModule,
        ControlsModule,
        TransactionFilterComponent,
        TxnRowComponent,
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
    }
    @Output() transactionsChange = new EventEmitter<Transactions>();
    @Output() budgets = new EventEmitter<Budgets>();

    /**
     * Show the filter controls at the top of the table
     */
    @Input() showFilters = true;

    /**
     * The filters to apply to the transactions.
     */
    @Input() filters = EMPTY_TRANSACTION_FILTER;
    @Output() filtersChange = new EventEmitter<TransactionFilter>();

    /**
     * Show the pagination controls at the bottom of the table.
     */
    @Input() showPaginate = true;
    /**
     * Truncate the description to 30 characters for neater display (since I can't figure out the css)
     */
    @Input() truncate = false;

    /**
     * Show the transaction headers (date, description, etc.)
     */
    txShow: TransactionShowHeaders = Settings.fromLocalStorage().txShow;

    /**
     * Allow the user to edit the transactions in place.
     */
    @Input() editable = false;

    txns = new Transactions();
    accountId2name = <Id2NameHashMap>{};
    page: PageEvent = {pageIndex: 0, pageSize: 10, length: 0};
    sort: TxnSortHeader = {column: 'datePosted', asc: true};
    length = 0;

    #oldTxnLen = 0;
    #cachedUpdates?: Subscription;
    #postFilterTxns = new Transactions();

    constructor(protected accountsService: AccountsService) {
        this.transactionsChange.subscribe(() => this.postFilter());
        this.filtersChange.subscribe(() => this.postFilter());
    }

    ngOnInit(): void {
        console.debug(this.transactions);
        const update = (accounts: Accounts) => {
            this.accountId2name = accounts.id2name;
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
     * Post filter, store a copy of the filtered, sorted transactions so we don't have to recalculate indexes.
     * This function will take the place of this.refresh() where the filter changes occur.
     */
    postFilter() {
        this.#postFilterTxns = <Transactions>this.transactions.search((txn: Transaction) => this.transactions.searchTransaction(this.filters, txn));
        this.length = this.#postFilterTxns.length;
        this.budgets.emit( this.#postFilterTxns.getBudgets() );
        this.page0();
    }

    /**
     * Post-paginate, we want to take the filtered, sorted transactions and paginate them, but don't recalculate the 
     * set just for flipping the pages.
     */
    postPaginate() {
        const offset = this.page.pageIndex * this.page.pageSize;
        const end = offset + this.page.pageSize;
        this.txns = <Transactions>this.#postFilterTxns.slice(offset, end);
    }

    filtation(filters: TransactionFilter): string {
        return JSON.stringify({
            fromDate: filters.fromDate,
            toDate: filters.toDate,
            description: filters.description,
            budgets: filters.budgets,
            accounts: filters.accounts?.map(x => ({id: x.id, name: x.name})),
            tags: filters.tags,
            sort: this.sort,
            page: filters.page,
        });
    }

    sortBy(header: TransactionFields): void {
        this.sort.asc = this.sort.column == header? !this.sort.asc: true;
        this.sort.column = header;
        this.#postFilterTxns = this.#postFilterTxns.sortBy(this.sort.column, this.sort.asc);
        this.page0();
    }

    removeTag(txn: Transaction, $event: MatChipEvent): void {
        txn.removeTag($event.chip.value);
    }


    addTag(txn: Transaction, $event: MatChipInputEvent): Transaction {
        return txn.addTag($event.value);
    }

    page0() {
        this.turnPage({pageIndex: 0, pageSize: this.page.pageSize, length: this.length});
    }

    turnPage($event: PageEvent): void {
        this.page = $event;
        this.postPaginate();
    }
}
