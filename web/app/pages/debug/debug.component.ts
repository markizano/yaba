import { Component } from '@angular/core';

import { Transactions } from 'app/lib/transactions';
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

    ngOnInit() {
        console.log('DebugComponent ngOnInit()');
    }
}
