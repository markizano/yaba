import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { EMPTY_TRANSACTION_FILTER } from 'app/lib/constants';
import { Budgets, TransactionShowHeaders, TransactionFilter, TxnSortHeader } from 'app/lib/types';
import { Transactions, Transaction } from 'app/lib/transactions';
import { Settings } from 'app/lib/settings';
import { YabaAnimations } from 'app/lib/animations';

import { AccountsService } from 'app/services/accounts.service';
import { ControlsModule } from 'app/controls/controls.module';

import { TransactionFilterComponent } from 'app/tables/transactions/txn-filter/txn-filter.component';
import { TxnRowComponent } from 'app/tables/transactions//txn-row/txn-row.component';
import { TagTransactionsComponent } from 'app/tables/transactions/txn-tags/txn-tag.component';
import { UntagTransactionComponent } from 'app/tables/transactions/txn-tags/txn-untag.component';

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
    animations: [
        YabaAnimations.fadeSlideDown()
    ],
    imports: [
        MatChipsModule,
        MatIconModule,
        ControlsModule,
        TransactionFilterComponent,
        TxnRowComponent,
        TagTransactionsComponent,
        UntagTransactionComponent,
        MatPaginatorModule,
    ],
})
export class TransactionsListComponent {
    addOnBlur = true;
    readonly separatorKeysCodes = [ENTER, COMMA] as const;

    @Input() transactions = new Transactions();
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

    txns = this.transactions ?? new Transactions();
    page: PageEvent = { pageIndex: 0, pageSize: 10, length: 0 };
    sort: TxnSortHeader = {column: 'datePosted', asc: true};
    selected = new Transactions();

    constructor(protected accountsService: AccountsService, protected chgDet: ChangeDetectorRef) {
        this.transactionsChange.subscribe((txns) => this.postFilter(txns));
    }

    ngOnInit() {
        if ( this.showFilters) {
            this.txns = this.transactions.search((txn: Transaction) => this.transactions.searchTransaction(this.filters, txn)).sortBy(this.sort.column, this.sort.asc);
        } else {
            this.txns = this.transactions.sortBy(this.sort.column, this.sort.asc);
        }
        this.budgets.emit( this.txns.getBudgets() );
        this.page0();
    }

    /**
     * Generate the list of rows to display on the current page based on page count.
     */
    genRows(): number[] {
        return Array.from(Array(Math.min(this.txns.length, this.page.pageSize)).keys()).map(x => x + (this.page.pageIndex * this.page.pageSize));
    }

    /**
     * Post filter, store a copy of the filtered, sorted transactions so we don't have to recalculate indexes.
     * This function will take the place of this.refresh() where the filter changes occur.
     */
    postFilter(txns?: Transactions) {
        console.log('TransactionListComponent().postFilter()', this.filters, txns?.length);
        this.txns = txns ?? this.transactions.search((txn: Transaction) => this.transactions.searchTransaction(this.filters, txn)).sortBy(this.sort.column, this.sort.asc);
        this.budgets.emit( this.txns.getBudgets() );
        this.page0();
    }

    filtation(filters: TransactionFilter): string {
        return JSON.stringify({
            fromDate: filters.fromDate,
            toDate: filters.toDate,
            description: filters.description,
            accounts: filters.accounts?.map(x => ({id: x.id, name: x.name})),
            tags: filters.tags,
            sort: this.sort,
            page: filters.page,
        });
    }

    sortBy(header: keyof Transaction): void {
        this.sort.asc = this.sort.column == header? !this.sort.asc: true;
        this.sort.column = header;
        this.txns = this.txns.sortBy(this.sort.column, this.sort.asc);
        this.page0();
    }

    tagTxns(tag: string): void {
        this.selected.setTag(tag);
        this.selected = new Transactions();
        this.budgets.emit( this.txns.getBudgets() );
    }

    untagTxns(tags: string[]): void {
        console.log('untag-txns', tags);
        tags.forEach(tag => this.selected.removeTag(tag));
        this.selected = new Transactions();
        this.budgets.emit( this.txns.getBudgets() );
    }

    deleteTxn(txn: Transaction): void {
        if ( this.editable ) {
            console.log('delete-txn', txn);
            this.transactions.remove(txn);
            this.transactionsChange.emit(this.transactions);
            this.chgDet.detectChanges();
        }
    }

    deleteSelected(): void {
        if ( this.editable ) {
            console.log('delete-selected', this.selected);
            this.selected.forEach((txn: Transaction) => {
                try{ this.deleteTxn(txn); } catch(e) { console.error(e); }
            });
            this.selected = new Transactions();
        }
    }

    /**
     * Cancels current selection response event.
     */
    cancelSelected(): void {
        this.selected = new Transactions();
    }

    page0() {
        this.turnPage({pageIndex: 0, pageSize: this.page.pageSize, length: this.txns.length});
    }

    /**
     * Turn page event handler.
     * @param {PageEvent} $event
     */
    turnPage($event: PageEvent): void {
        // if the page size is changed, reset the page to 0.
        if ($event.pageSize != this.page.pageSize) {
            $event.pageIndex = 0;
        }
        this.page = $event;
    }
}
