import { Component, EventEmitter, Input, Output } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatIconModule } from '@angular/material/icon';
import { MatChipEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';

import { TransactionHeaders } from 'app/lib/structures';
import { Transactions, EditPlaceholder, Transaction, TransactionFilter, SortHeader, ITransaction, TransactionFields, IBudget } from 'app/lib/transactions';
import { Account, Accounts } from 'app/lib/accounts';
import { ControlsModule } from 'app/controls/controls.module';
import { PaginationComponent } from 'app/controls/pagination.component';
import { TransactionsService } from 'app/services/transactions.service';
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
        PaginationComponent
    ],
})
export class TransactionsListComponent {
    addOnBlur = true;
    readonly separatorKeysCodes = [ENTER, COMMA] as const;
    // Data
    @Input() accountId?: string;

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
    @Input() sort: SortHeader;
    @Input() limit: number;

    currentlyEditing: EditPlaceholder;
    transactions: Transactions;
    txns: Transactions;
    accountId2name: AccountIdHashMap;

    constructor(protected accountsService: AccountsService, protected txnService: TransactionsService) {
        this.accountId = '';
        this.sort = { column: 'datePosted', asc: true };
        this.showFilters = true;
        this.filters = <TransactionFilter>{
            fromDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            toDate: new Date(),
            description: '',
            budgets: [],
            accounts: [],
        };
        this.showPaginate = true;
        this.withHeader = true;
        this.withTags = true;
        this.limit = 1000;
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
        this.accountsService.load().then(
            (accounts: Accounts) => {
                this.accountId2name = accounts.reduce((a: AccountIdHashMap, b: Account) => { a[b.id] = b.name; return a; }, {});
                console.log('TransactionListComponent().ngOnInit().accountsService.load()', this.accountId2name);
            },
            (error) => console.error('TransactionListComponent().ngOnInit().accountsService.load()', error) );
        this.txnService.load().then(
            (_txns: Transactions) => {
                const txns = new Transactions(..._txns);
                if ( this.accountId ) {
                    console.log(`By AccountId: ${this.accountId}`);
                    this.transactions.push(...txns.byAccountId(this.accountId));
                } else {
                    this.transactions.push(...txns);
                }
                console.log('TransactionsListComponent().ngOnInit().load()', this.transactions);
            }, (error) => {
                console.error('TransactionsListComponent().ngOnInit().load()', error);
            });
    }

    /**
     * Update the cached txns from the post-filtered transactions based on user-input filters.
     */
    refresh() {
        this.txns.clear();
        this.txns.push(...this.transactions
            .byAccountIds(this.filters.accounts.map((x: Account) => x.id))
            .daterange(this.filters.fromDate, this.filters.toDate)
            .byDescription(this.filters.description)
            .byTags(this.filters.budgets.map((x: IBudget) => x.tag))
            .sortBy(this.sort.column, this.sort.asc)
        );
    }

    sortBy(header: TransactionFields) {
        this.sort.column = header;
        return ((sortAgent: SortHeader) => (field: TransactionFields) => {
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

    edit2view(field: keyof EditPlaceholder, value: unknown) {
        this.currentlyEditing[field] = false;
        this.save();
    }
}
