import { Component, inject, OnDestroy, OnInit } from '@angular/core';

import { Budgets } from 'app/lib/types';
import { EMPTY_TRANSACTION_FILTER } from 'app/lib/constants';
import { Accounts } from 'app/lib/accounts';
import { Transactions } from 'app/lib/transactions';
import { AccountsService } from 'app/services/accounts.service';
import { Subscription } from 'rxjs';

/**
 * This component is the main budgeting page. It displays the transactions and allows the user to filter them.
 * The user can also edit the transactions on the page. Changing transactions influences the budgets panel.
 */
@Component({
    selector: 'yaba-budgeting',
    templateUrl: './budgeting.html',
    styleUrls: ['./budgeting.css'],
    standalone: false,
})
export class BudgetingComponent implements OnInit, OnDestroy {
    txns = new Transactions();
    filters = Object.assign(EMPTY_TRANSACTION_FILTER, {
        description: '',
        accounts: [],
    });
    budgets: Budgets = [];
    errors: string[] = [];
    #cachedUpdates?: Subscription;

    protected accountsService = inject(AccountsService);

    ngOnInit() {
        const update = (accounts: Accounts) => {
            this.txns = Transactions.fromList(accounts.map(a => a.transactions).flat());
            this.budgets = this.txns.getBudgets();
            console.log('BudgetingComponent ngOnInit()', this.txns, this.budgets);
        };
        update(this.accountsService.get());
        this.#cachedUpdates = this.accountsService.subscribe(update);
    }

    ngOnDestroy() {
        this.#cachedUpdates?.unsubscribe();
    }

    localBudgets($event: Budgets) {
        console.log('localBudgets()', $event);
        this.budgets = $event;
    }
}
