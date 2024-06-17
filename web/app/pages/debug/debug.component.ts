import { Component } from '@angular/core';

import { TransactionFilter, Transactions } from 'app/lib/transactions';
import { AccountsService } from 'app/services/accounts.service';
import { TransactionsListComponent } from 'app/tables/transactions/transactions-list.component';

@Component({
    selector: 'debugging',
    standalone: true,
    imports: [
        TransactionsListComponent,
    ],
    templateUrl: './debug.component.html',
})
export class DebugComponent {
    transactions: Transactions;

    constructor(protected accountsService: AccountsService) {
        this.transactions = new Transactions();
    }

    async ngOnInit() {
        console.log('DebugComponent ngOnInit()');
        this.accountsService.event.on('loaded', (accounts) => {
            this.transactions.clear();
            console.log('DebugComponent().Accounts:', accounts);
            this.transactions.add(...accounts.getTransactions(<TransactionFilter>{}));
            console.log('DebugComponent().Transactions:', this.transactions);
            });
        this.accountsService.load();
    }
}
