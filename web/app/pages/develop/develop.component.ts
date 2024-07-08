import { Component, Inject } from '@angular/core';
import { AccountsFilterComponent } from 'app/controls/account-filter.component';

import { EMPTY_TRANSACTION_FILTER } from 'app/lib/constants';
import { Transaction, Transactions } from 'app/lib/transactions';
import { AccountsService } from 'app/services/accounts.service';
import { TransactionsListComponent } from 'app/tables/transactions/transactions-list.component';
import { NULLDATE } from 'app/lib/constants';
import { Account, Accounts } from 'app/lib/accounts';
import { ControlsModule } from 'app/controls/controls.module';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { Institution, Institutions } from 'app/lib/institutions';

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
    filters = EMPTY_TRANSACTION_FILTER;
    #cachedUpdate?: Subscription;

    constructor(protected accountsService: AccountsService, @Inject(DOCUMENT) protected document: Document ) {
        this.filters.fromDate = NULLDATE;
        this.filters.accounts = [];
        const Yaba = {
            Institution, Institutions,
            Account, Accounts,
            Transaction, Transactions,
        };
        Object.assign(this.document, {Yaba: Yaba});
    }

    ngOnInit() {
        console.log('DevelopComponent ngOnInit()');
        const update = (accounts: Accounts) => {
            this.transactions.clear();
            this.transactions = Transactions.fromList(accounts.map(a => a.transactions).flat()).sorted();
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
