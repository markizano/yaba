import { Component } from '@angular/core';
import { AccountsFilterComponent } from 'app/controls/account-filter.component';
import { TransactionShowHeaders } from 'app/lib/types';

import { EMPTY_TRANSACTION_FILTER, TransactionFilter, Transactions } from 'app/lib/transactions';
import { AccountsService } from 'app/services/accounts.service';
import { TransactionsListComponent } from 'app/tables/transactions/transactions-list.component';

@Component({
    selector: 'debugging',
    standalone: true,
    imports: [
        TransactionsListComponent,
        AccountsFilterComponent,
    ],
    templateUrl: './develop.component.html',
})
export class DevelopComponent {
    transactions: Transactions;
    filters: TransactionFilter;
    txShow: TransactionShowHeaders;

    constructor(protected accountsService: AccountsService) {
        this.transactions = new Transactions();
        this.filters = EMPTY_TRANSACTION_FILTER;
        this.filters.fromDate = new Date('2000-01-01 00:00:00 UTC');
        this.filters.accounts = undefined;
        this.txShow = <TransactionShowHeaders>{
            id: false,
            account: true,
            datePending: false,
            merchant: false,
            transactionType: false,
        };
    }

    ngOnInit() {
        console.log('DevelopComponent ngOnInit()');
        this.accountsService.load().subscribe((accounts) => {
            this.transactions.clear();
            // console.log('DevelopComponent().Accounts:', accounts);
            this.transactions.add(...new Transactions( ...accounts.map(a => a.transactions).flat() ));
            // console.log('DevelopComponent().Transactions:', this.transactions);
        });
    }

    log(data: unknown) {
        console.log(data);
    }
}
