import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatIconModule } from '@angular/material/icon';
import { MatChipEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';

import { DEFAULT_DATERANGE } from 'app/lib/constants';
import { TransactionShowHeaders, PageTurn } from 'app/lib/types';
import { Transactions, EditPlaceholder, Transaction, TransactionFilter, TxnSortHeader, ITransaction, TransactionFields } from 'app/lib/transactions';

import { AccountsService } from 'app/services/accounts.service';
import { ControlsModule } from 'app/controls/controls.module';
import { PaginationComponent } from 'app/controls/pagination.component';
import { TxnEditDirective } from 'app/tables/transactions/txn-edit.directive';
import { TransactionFilterComponent } from 'app/controls/txn-filter.component';

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
    page: PageTurn;

    constructor(protected accountsService: AccountsService, protected chgDet: ChangeDetectorRef) {
        this.sort = { column: 'datePosted', asc: true };
        this.showFilters = true;
        this.limit = -1;
        this.page = { page: 0, offset: 0, itemsPerPage: 10};
        this.filters = <TransactionFilter>{
            fromDate: new Date(Date.now() - DEFAULT_DATERANGE),
            toDate: new Date(),
            description: '',
            budgets: [],
            accounts: [],
            tags: [],
            limit: this.limit,
            sort: this.sort,
            page: this.page
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
        this.transactionsChange.subscribe(() => this.refresh());
        this.filtersChange.subscribe(() => this.refresh());
    }

    ngOnInit() {
        this.filters.limit = this.limit;
        this.filters.page = this.page;
        this.refresh();
        // console.log('TransactionsListComponent().ngOnInit().transactions', this.transactions.length, this.transactions);
        // this.accountsService.load().subscribe((accounts) => {
        //     // console.log('TransactionsListComponent().ngOnInit().transactionsLoaded', this.transactions.length, this.transactions);
        //     this.filters.accounts = accounts;
        //     const filteredTxns = new Transactions(...accounts.getTransactions(this.filters));
        //     this.txns.add(...filteredTxns);
        //     this.refresh();
        // });
    }

    filtation(): string {
        return JSON.stringify((f => ({
            fromDate: f.fromDate,
            toDate: f.toDate,
            description: f.description,
            budgets: f.budgets,
            accounts: f.accounts?.map(x => ({id: x.id, name: x.name})),
            tags: f.tags,
            limit: f.limit,
            sort: f.sort
        }))(this.filters));
    }

    /**
     * Update the cached txns from the post-filtered transactions based on user-input filters.
     */
    refresh() {
        console.log('TransactionListComponent().refresh()');
        this.filters.page = this.page;
        this.txns.clear().add(...this.transactions.getTransactions(this.filters));
        console.debug({filters: this.filters, transactions: this.transactions, txns: this.txns});
        this.chgDet.detectChanges();
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


    addTag(txn: ITransaction, $event: MatChipInputEvent) {
        return (<Transaction>txn).addTag($event.value);
    }

    turnPage($event: PageTurn) {
        console.log('page turned:', $event);
        this.page = $event;
        this.filters.page = $event;
        this.filtersChange.emit(this.filters);
    }
}
