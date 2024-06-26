import { Component, EventEmitter } from '@angular/core';
import { AccountsFilterComponent } from 'app/controls/account-filter.component';

import { EMPTY_TRANSACTION_FILTER } from 'app/lib/constants';
import { Transactions } from 'app/lib/transactions';
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
    transactions = new Transactions();
    transactionsChange = new EventEmitter<Transactions>();
    filters = EMPTY_TRANSACTION_FILTER;
    #cachedUpdate?: Subscription;

    constructor(protected accountsService: AccountsService) {
        this.filters.fromDate = NULLDATE;
        // this.filters.accounts = undefined;
    }

    ngOnInit() {
        console.log('DevelopComponent ngOnInit()');
        const update = (accounts: Accounts) => {
            this.transactions.clear();
            this.transactions = new Transactions(...accounts.map(a => a.transactions).flat());
        }
        update(this.accountsService.get());
        this.#cachedUpdate = this.accountsService.subscribe((accounts: Accounts) => update(accounts));
    }

    ngOnDestroy() {
        this.#cachedUpdate?.unsubscribe();
    }

    log(data: unknown) {
        console.log(data);
    }
}
