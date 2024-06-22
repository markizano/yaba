import { Component, EventEmitter } from '@angular/core';
import { AccountsFilterComponent } from 'app/controls/account-filter.component';
import { TransactionShowHeaders } from 'app/lib/types';

import { EMPTY_TRANSACTION_FILTER, TransactionFilter, Transactions } from 'app/lib/transactions';
import { AccountsService } from 'app/services/accounts.service';
import { TransactionsListComponent } from 'app/tables/transactions/transactions-list.component';
import { NULLDATE } from 'app/lib/constants';
import { Accounts } from 'app/lib/accounts';
import { ControlsModule } from 'app/controls/controls.module';
import { Subscription } from 'rxjs';

@Component({
    selector: 'debugging',
    standalone: true,
    imports: [
        ControlsModule,
        TransactionsListComponent,
        AccountsFilterComponent,
    ],
    templateUrl: './develop.component.html',
})
export class DevelopComponent {
    transactions: Transactions;
    transactionsChange: EventEmitter<Transactions>;
    filters: TransactionFilter;
    txShow: TransactionShowHeaders;
    #cachedUpdate?: Subscription;

    constructor(protected accountsService: AccountsService) {
        this.transactions = new Transactions();
        this.transactionsChange = new EventEmitter<Transactions>();
        this.filters = EMPTY_TRANSACTION_FILTER;
        this.filters.fromDate = NULLDATE;
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
        this.#cachedUpdate = this.accountsService.subscribe((accounts: Accounts) => {
            this.transactions.clear();
            // const accounts = this.accountsService.get();
            console.log('DevelopComponent().Accounts:', accounts);
            this.transactions = new Transactions(...accounts.map(a => a.transactions).flat());
        });
    }

    ngOnDestroy() {
        this.#cachedUpdate?.unsubscribe();
    }

    log(data: unknown) {
        console.log(data);
    }
}
