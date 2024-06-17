import { Component } from '@angular/core';
import { AccountsFilterComponent } from 'app/controls/account-filter.component';
import { TransactionShowHeaders } from 'app/lib/structures';

import { TransactionFilter, Transactions } from 'app/lib/transactions';
import { AccountsService } from 'app/services/accounts.service';
import { TransactionsListComponent } from 'app/tables/transactions/transactions-list.component';

@Component({
    selector: 'debugging',
    standalone: true,
    imports: [
        TransactionsListComponent,
        AccountsFilterComponent,
    ],
    templateUrl: './debug.component.html',
})
export class DebugComponent {
    transactions: Transactions;
    filters: TransactionFilter;
    txShow: TransactionShowHeaders;

    constructor(protected accountsService: AccountsService) {
        this.transactions = new Transactions();
        this.filters = <TransactionFilter>{};
        this.txShow = <TransactionShowHeaders>{
            id: false,
            account: false,
            datePending: false,
            merchant: false,
            transactionType: false,
            tags: false,
        };
    }

    ngOnInit() {
        console.log('DebugComponent ngOnInit()');
        this.accountsService.load().subscribe((accounts) => {
            this.transactions.clear();
            console.log('DebugComponent().Accounts:', accounts);
            this.transactions.add(...accounts.getTransactions(<TransactionFilter>{}));
            console.log('DebugComponent().Transactions:', this.transactions);
        });
    }

    log(data: unknown) {
        console.log(data);
    }
}
