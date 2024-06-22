import { Component, EventEmitter, Input, Output } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatChipEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';

import { DEFAULT_DATERANGE } from 'app/lib/constants';
import { TransactionShowHeaders } from 'app/lib/types';
import { Transactions, EditPlaceholder, Transaction, TransactionFilter, TxnSortHeader, TransactionFields } from 'app/lib/transactions';

import { AccountsService } from 'app/services/accounts.service';
import { ControlsModule } from 'app/controls/controls.module';
import { PaginationComponent } from 'app/controls/pagination.component';
import { TxnEditDirective } from 'app/tables/transactions/txn-edit.directive';
import { TransactionFilterComponent } from 'app/controls/txn-filter.component';
import { Accounts } from 'app/lib/accounts';

type AccountIdHashMap = { [key: string]: string };

@Component({
    selector: 'yaba-transaction-list',
    templateUrl: './transactions-list.component.html',
    standalone: true,
    imports: [
        MatChipsModule,
        MatIconModule,
        ControlsModule,
        PaginationComponent,
        TransactionFilterComponent,
        TxnEditDirective,
        MatPaginatorModule,
    ],
})
export class TransactionsListComponent {
    addOnBlur = true;
    readonly separatorKeysCodes = [ENTER, COMMA] as const;
    // Data
    #transactions: Transactions;
    @Input() get transactions(): Transactions {
        return this.#transactions;
    }
    set transactions(value: Transactions) {
        this.#transactions = value;
        this.refresh();
    }
    @Output() transactionsChange = new EventEmitter<Transactions>();

    // Filtering
    @Input() showFilters: boolean;

    @Input() filters: TransactionFilter;
    @Output() filtersChange = new EventEmitter<TransactionFilter>();

    // Decorators
    @Input() showPaginate: boolean;
    @Input() txShow?: TransactionShowHeaders;

    @Input() editable: boolean;
    @Input() showHeader: boolean;
    @Input() showTags: boolean;

    currentlyEditing: EditPlaceholder;
    txns: Transactions;
    accountId2name: AccountIdHashMap;

    #oldTxnLen: number;

    constructor(protected accountsService: AccountsService) {
        console.log('new TransactionsListComponent()');
        this.showFilters = true;
        this.filters = <TransactionFilter>{
            fromDate: new Date(Date.now() - DEFAULT_DATERANGE),
            toDate: new Date(),
            description: '',
            budgets: [],
            accounts: [],
            tags: [],
            limit: -1,
            sort: {
                column: 'datePosted',
                asc: true
            },
            page: {
                pageIndex: 0,
                pageSize: 0,
                length: 0,
            }
        };
        this.showPaginate = true;
        this.showHeader = true;
        this.showTags = true;
        this.editable = false;
        this.currentlyEditing = <EditPlaceholder>{
            datePending: false,
            datePosted: false,
            amount: false,
            description: false,
            merchant: false,
            transactionType: false,
            tags: false,
        };
        this.#transactions = new Transactions();
        this.txns = new Transactions();
        this.accountId2name = {};
        this.#oldTxnLen = 0;
    }

    ngOnInit(): void {
        console.log('TransactionsListComponent().ngOnInit()');
        console.debug(this.transactions);
        this.accountsService.subscribe((acts: Accounts) => {
            this.accountId2name = new Accounts(...acts).reduce((acc, x) => {
                acc[x.id] = x.name;
                return acc;
            }, <AccountIdHashMap>{});
        });
    }

    ngDoCheck() {
        if (this.transactions.length != this.#oldTxnLen) {
            this.#oldTxnLen = this.transactions.length;
            this.transactionsChange.emit(this.transactions);
        }
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

    filtation(): string {
        return JSON.stringify((f => ({
            fromDate: f.fromDate,
            toDate: f.toDate,
            description: f.description,
            budgets: f.budgets,
            accounts: f.accounts?.map(x => ({id: x.id, name: x.name})),
            tags: f.tags,
            sort: f.sort,
            page: f.page,
        }))(this.filters));
    }

    sortBy(header: TransactionFields): (field: TransactionFields) => TxnSortHeader{
        this.filters.sort.column = header;
        return ((sortAgent: TxnSortHeader) => (field: TransactionFields) => {
            sortAgent.asc = sortAgent.column == field? !sortAgent.asc: true;
            sortAgent.column = field;
            return sortAgent;
        })(this.filters.sort);
    }

    removeTag(txn: Transaction, $event: MatChipEvent): void {
        txn.removeTag($event.chip.value);
    }


    addTag(txn: Transaction, $event: MatChipInputEvent) {
        return txn.addTag($event.value);
    }

    turnPage($event: PageEvent) {
        console.log('page turned:', $event);
        this.filters.page.length = $event.length;
        this.filters.page.pageSize = $event.pageSize;
        this.filters.page.pageIndex = $event.pageIndex;
        this.filtersChange.emit(this.filters);
        this.refresh();
    }
}
