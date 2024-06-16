import { Component, EventEmitter, Input, Output } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatIconModule } from '@angular/material/icon';
import { MatChipEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';

import { TransactionHeaders } from 'app/lib/structures';
import { Transactions, EditPlaceholder, Transaction, TransactionFilter, TxnSortHeader, ITransaction, TransactionFields } from 'app/lib/transactions';
import { ControlsModule } from 'app/controls/controls.module';
import { PaginationComponent } from 'app/controls/pagination.component';
import { TxnEditDirective } from './txn-edit.directive';

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
        TxnEditDirective,
    ],
})
export class TransactionsListComponent {
    addOnBlur = true;
    readonly separatorKeysCodes = [ENTER, COMMA] as const;
    // Data
    @Input() transactions: Transactions;
    @Output() transactionsChange = new EventEmitter<Transactions>();

    // Filtering
    @Input() showFilters: boolean;

    @Input() filters: TransactionFilter;
    @Output() filtersChange = new EventEmitter<TransactionFilter>();

    // Decorators
    @Input() showPaginate: boolean;
    @Input() txShow?: TransactionHeaders;

    @Input() editable: boolean;
    @Input() withHeader: boolean;
    @Input() withTags: boolean;
    // Sorting and Ordering
    @Input() sort: TxnSortHeader;
    @Input() limit: number;

    currentlyEditing: EditPlaceholder;
    txns: Transactions;
    accountId2name: AccountIdHashMap;

    constructor() {
        this.sort = { column: 'datePosted', asc: true };
        this.showFilters = true;
        this.limit = -1;
        this.filters = <TransactionFilter>{
            fromDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            toDate: new Date(),
            description: '',
            budgets: [],
            accounts: [],
            tags: [],
            limit: this.limit,
            sort: this.sort
        };
        this.showPaginate = true;
        this.withHeader = true;
        this.withTags = true;
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
        this.transactions = new Transactions();
        this.txns = new Transactions();
        this.accountId2name = {};
    }

    ngOnInit() {
        try {
            this.refresh();
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Update the cached txns from the post-filtered transactions based on user-input filters.
     */
    refresh() {
        this.txns.clear();
        if ( this.showFilters ) {
            this.txns.push(...this.transactions.getTransactions(this.filters));
        } else {
            if ( this.limit > -1 ) {
                this.txns.push(...this.transactions.slice(0, this.limit));
            } else {
                this.txns.push(...this.transactions);
            }
        }
    }

    sortBy(header: TransactionFields) {
        this.sort.column = header;
        return ((sortAgent: TxnSortHeader) => (field: TransactionFields) => {
            sortAgent.asc = sortAgent.column == field? !sortAgent.asc: true;
            sortAgent.column = field;
            return sortAgent;
        })(this.sort);
    }

    removeTag(txn: ITransaction, $event: MatChipEvent) {
        return (<Transaction>txn).removeTag($event.chip.value);
    }

    save() {
        // @TODO: access storables and store to disk.
    }

    addTag(txn: ITransaction, $event: MatChipInputEvent) {
        return (<Transaction>txn).addTag($event.value);
    }
}
