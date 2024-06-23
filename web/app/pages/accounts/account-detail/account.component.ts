import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Account, Accounts } from 'app/lib/accounts';
import { EMPTY_TRANSACTION_FILTER } from 'app/lib/transactions';
import { TransactionShowHeaders } from 'app/lib/types';
import { AccountsService } from 'app/services/accounts.service';
import { Subscription } from 'rxjs';

/**
 * This component is responsible for displaying the details of a single account.
 */
@Component({
    selector: 'yaba-account',
    templateUrl: './account.component.html',
})
export class AccountDetailComponent {
    @Input() id = this.router.url.split('/').pop() ?? '';
    accounts = new Accounts();
    account = new Account();
    filters = EMPTY_TRANSACTION_FILTER;
    txShow = <TransactionShowHeaders>{
        id: false,
        account: true,
        datePending: false,
        merchant: true,
        transactionType: true
    };
    errors: string[] = [];

    // @TODO: Add form headers/variables.

    #cacheUpdate?: Subscription;

    constructor(protected router: Router, protected accountsService: AccountsService) {
        console.log('AccountDetailComponent constructor');
        this.filters.fromDate = new Date('2000-01-01 00:00:00 UTC');
        this.filters.accounts = undefined;
    }

    ngOnInit() {
        console.log('AccountDetailComponent() ngOnInit()');
        const update = (accounts: Accounts) => {
            this.errors.length = 0;
            this.accounts = accounts;
            try {
                const account = this.accounts.byId(this.id);
                if ( account ) {
                    console.log('AccountDetailComponent() ngOnInit() found account: ', account);
                    this.account.update(account);
                } else {
                    this.errors.push(`Account ${this.id} not found.`);
                }
            } catch (e) {
                console.error('Error loading account', e);
                this.errors.push(<string>e);
            }
        }
        update(this.accountsService.get());
        this.#cacheUpdate = this.accountsService.subscribe(update);
    }

    /**
     * Clean up the subscriptions.
     */
    ngOnDestroy() {
        console.log('AccountDetailComponent() ngOnDestroy()');
        this.#cacheUpdate?.unsubscribe();
    }

    // @TODO: Add form functions.
}
