import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatIconModule } from '@angular/material/icon';
import { MatChipEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';

import { DEFAULT_DATERANGE, TransactionShowHeaders } from 'app/lib/structures';
import { Transactions, EditPlaceholder, Transaction, TransactionFilter, TxnSortHeader, ITransaction, TransactionFields } from 'app/lib/transactions';
import { ControlsModule } from 'app/controls/controls.module';
import { PaginationComponent } from 'app/controls/pagination.component';
import { TxnEditDirective } from 'app/tables/transactions/txn-edit.directive';
import { TransactionFilterComponent } from 'app/controls/txn-filter.component';
import { AccountsService } from 'app/services/accounts.service';

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
        PaginationComponent,
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
    @Input() txShow?: TransactionShowHeaders;

    @Input() editable: boolean;
    @Input() withHeader: boolean;
    @Input() withTags: boolean;
    // Sorting and Ordering
    @Input() sort: TxnSortHeader;
    @Input() limit: number;

    currentlyEditing: EditPlaceholder;
    txns: Transactions;
    accountId2name: AccountIdHashMap;

    constructor(protected accountsService: AccountsService, protected chgDet: ChangeDetectorRef) {
        this.sort = { column: 'datePosted', asc: true };
        this.showFilters = true;
        this.limit = -1;
        this.filters = <TransactionFilter>{
            fromDate: new Date(Date.now() - DEFAULT_DATERANGE),
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


        // this.transactionsChange.subscribe(() => {
        //     this.refresh();
        // });
    }

    ngOnInit() {
        console.log('TransactionsListComponent().ngOnInit().transactions', this.transactions.length, this.transactions);
        this.accountsService.load().subscribe(() => {
            console.log('TransactionsListComponent().ngOnInit().transactionsLoaded', this.transactions.length, this.transactions);
        });
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
            this.txns.add(...this.transactions.getTransactions(this.filters));
        } else {
            this.txns.add(...this.transactions);
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
