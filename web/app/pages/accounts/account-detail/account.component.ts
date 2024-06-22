import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Account, Accounts } from 'app/lib/accounts';
import { EMPTY_TRANSACTION_FILTER, TransactionFilter } from 'app/lib/transactions';
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
    @Input() id: string;
    accounts: Accounts;
    account: Account;
    filters: TransactionFilter;
    txShow: TransactionShowHeaders;
    errors: string[] = [];

    #cacheUpdate: Subscription;

    constructor(protected router: Router, protected accountsService: AccountsService) {
        console.log('AccountDetailComponent constructor');
        this.id = this.router.url.split('/').pop() ?? '';
        this.accounts = new Accounts();
        this.account = new Account();
        this.filters = EMPTY_TRANSACTION_FILTER;
        this.filters.fromDate = new Date('2000-01-01 00:00:00 UTC');
        this.filters.accounts = undefined;
        this.txShow = <TransactionShowHeaders>{
            id: false,
            account: true,
            datePending: false,
            merchant: true,
            transactionType: true
        };
        this.#cacheUpdate = this.accountsService.subscribe((accounts: Accounts) => {
            this.errors.length = 0;
            console.log('AccountDetailComponent().accountsService.subscribe() loaded accounts: ', accounts);
            this.accounts.clear();
            this.accounts.add(...accounts);
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
        });
    }

    /**
     * Clean up the subscriptions.
     */
    ngOnDestroy() {
        console.log('AccountDetailComponent() ngOnDestroy()');
        this.#cacheUpdate.unsubscribe();
    }
}
