import { Subscription } from 'rxjs';

import { Component, OnInit, OnDestroy } from '@angular/core';

import { AccountsService } from 'app/services/accounts.service';
import { Accounts } from 'app/lib/accounts';
import { TransactionFilter } from 'app/lib/types';
import { Transactions } from 'app/lib/transactions';

@Component({
    selector: 'yaba-charts',
    templateUrl: './charts.html',
    styleUrls: ['./charts.css'],
    standalone: false,
})
export class ChartsComponent implements OnInit, OnDestroy {
    filter: TransactionFilter = <TransactionFilter>{};

    // Properties from AngularJS translation
    accounts: Accounts = new Accounts();
    transactions: Transactions = new Transactions();
    selectedAccounts: any;
    fromDate: Date = new Date();
    toDate: Date = new Date();
    description: string = '';
    txnTags: string[] = [];
    myBudgets: any;
    chart: any;

    #acct?: Subscription;

    constructor(private accountsService: AccountsService) {
        console.log('new ChartsComponent()');
    }

    ngOnInit(): void {
        console.info('Charts controller');
        // Subscribe to accounts service
        const update = (accounts: Accounts) => {
            this.accounts = accounts;
            this.filter.accounts = accounts;
            this.rebalance();
        };
        update(this.accountsService.get());
        this.#acct = this.accountsService.subscribe(update);
    }

    ngOnDestroy(): void {
        this.#acct?.unsubscribe();
    }

    rebalance(): void {
        this.transactions.clear();

        // Create TransactionFilter object with the current filter values
        const searchFilter: TransactionFilter = {
            fromDate: this.fromDate,
            toDate: this.toDate,
            description: this.description,
            accounts: this.selectedAccounts,
            tags: this.txnTags,
            sort: { column: 'datePosted', asc: false },
            page: { pageIndex: 0, pageSize: -1, length: 0 }
        };

        this.transactions.push(...this.accounts.getTransactions(searchFilter));
    }
}
