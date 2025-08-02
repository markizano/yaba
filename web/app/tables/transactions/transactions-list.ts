import { Subscription } from 'rxjs';
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    inject
} from '@angular/core';
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

import { TransactionFilterComponent } from 'app/tables/transactions/txn-filter/txn-filter';
import { TxnRowComponent } from 'app/tables/transactions/txn-row/txn-row';
import { TagTransactionsComponent } from 'app/tables/transactions/txn-tags/txn-tag';
import { UntagTransactionComponent } from 'app/tables/transactions/txn-tags/txn-untag';

/**
 * This component is a table that displays transactions. It can be filtered, sorted, and paginated.
 *
 * @example
 * <yaba-transaction-list [accountId]="account.id" [filters]="filters" [showFilters]="true" [showPaginate]="true" [editable]="true" [showTags]="true"></yaba-transaction-list>
 */
@Component({
    selector: 'yaba-transaction-list',
    templateUrl: './transactions-list.html',
    styleUrls: ['./transactions-list.css'],
    animations: [
        YabaAnimations.fadeSlideDown()
    ],
    imports: [
    MatChipsModule,
    MatIconModule,
    MatPaginatorModule,
    ControlsModule,
    TransactionFilterComponent,
    TxnRowComponent,
    TagTransactionsComponent,
    UntagTransactionComponent,
],
})
export class TransactionsListComponent implements OnInit, OnDestroy {
    addOnBlur = true;
    readonly separatorKeysCodes = [ENTER, COMMA] as const;

    @Output() budgets = new EventEmitter<Budgets>();

    @Input() accountId?: string;

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
    page: PageEvent = { pageIndex: 0, pageSize: 10, length: 0 };
    sort: TxnSortHeader = {column: 'datePosted', asc: true};
    selected = new Transactions();
    #acctChg?: Subscription;

    protected accountsService = inject(AccountsService);
    protected chgDet = inject(ChangeDetectorRef);

    constructor() {
        console.log('new TransactionsListComponent()');
    }

    ngOnInit() {
        console.log('TransactionsListComponent().ngOnInit()');
        this.accountsChange();
        this.#acctChg = this.accountsService.subscribe(() => this.accountsChange());
    }

    ngOnDestroy() {
        this.#acctChg?.unsubscribe();
    }

    /**
     * Generate the list of rows to display on the current page based on page count.
     */
    genRows(): number[] {
        return Array.from(Array(Math.min(this.txns.length, this.page.pageSize)).keys()).map(x => x + (this.page.pageIndex * this.page.pageSize));
    }

    /**
     * Anytime the accounts are updated, trigger a re-render of the transactions.
     */
    accountsChange() {
        console.log('TransactionListComponent().accountsChange()', { filters: this.filters });
        this.page0();
        if ( this.accountId ) {
            const account = this.accountsService.get().byId(this.accountId);
            if ( account ) {
                this.txns = account.transactions.getTransactions(this.filters);
            } else {
                throw new Error(`Account ${this.accountId} not found.`);
            }
        } else {
            this.txns = Transactions.fromList(this.accountsService.get().map(a => a.transactions.getTransactions(this.filters)).flat()).sorted();
        }
        this.budgets.emit( this.txns.getBudgets() );
    }

    /**
     * Just used for debugging.
     * Render the filters for us to see in the dashboard.
     */
    filtration(filters: TransactionFilter): string {
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

    /**
     * Sort the transactions by the given header.
     */
    sortBy(header: keyof Transaction): void {
        this.sort.asc = this.sort.column == header? !this.sort.asc: true;
        this.sort.column = header;
        this.page0();
        this.accountsChange();
    }

    /**
     * Handles selection event.
     * If checked, add to the selection list.
     * If unchecked, remove from the list.
     */
    selectionHandler(checked: boolean, txn: Transaction): void {
        console.log(`TransactionListComponent().select(${checked})`, txn);
        if ( checked ) {
            this.selected.add(txn);
        } else {
            this.selected.remove(txn);
        }
    }

    /**
     * Tag the selected transactions with the given tag.
     */
    tagTxns(tag: string): void {
        this.selected.setTag(tag);
        this.selected = new Transactions();
        this.budgets.emit( this.txns.getBudgets() );
    }

    /**
     * Untag the selected transactions with the given tag.
     */
    untagTxns(tags: string[]): void {
        console.log('untag-txns', tags);
        tags.forEach(tag => this.selected.removeTag(tag));
        this.selected = new Transactions();
        this.budgets.emit( this.txns.getBudgets() );
    }

    /**
     * Delete the given transaction.
     */
    deleteTxn(txn: Transaction): void {
        if ( this.editable ) {
            console.log('delete-txn', txn);
            this.txns.remove(txn);
            this.accountsService.get().byId(txn.accountId)?.transactions.remove(txn);
            this.accountsService.save(this.accountsService.get());
            this.budgets.emit( this.txns.getBudgets() );
        }
    }

    /**
     * Deletes all selected transactions.
     */
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
     * Edit the given transaction.
     */
    editTxn(txn: Transaction): void {
        console.log('TransactionListComponent().editTxn()', txn);
        this.accountsService.get().byId(txn.accountId)?.transactions.byId(txn.id)?.update(txn)
        this.accountsService.save(this.accountsService.get());
        this.budgets.emit( this.txns.getBudgets() );
    }

    /**
     * Cancels current selection response event.
     */
    cancelSelected(): void {
        this.selected = new Transactions();
    }

    /**
     * Return to page 0.
     */
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
