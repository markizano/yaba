import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Account, Accounts } from 'app/lib/accounts';
import { EMPTY_TRANSACTION_FILTER } from 'app/lib/constants';
import { Transactions } from 'app/lib/transactions';
import { TransactionShowHeaders } from 'app/lib/types';
import { AccountsService } from 'app/services/accounts.service';
import { InstitutionsService } from 'app/services/institutions.service';

/**
 * This component is responsible for displaying the details of a single account.
 * It accepts a CSV file as a drop target to import transactions.
 */
@Component({
    selector: 'yaba-account',
    templateUrl: './account.html',
    styleUrls: ['./account.css'],
    standalone: false,
})
export class AccountDetailComponent {
    protected router = inject(Router);
    @Input() id = this.router.url.split('/').pop() ?? '';
    accounts = new Accounts();
    account = new Account();
    filters = Object.assign(EMPTY_TRANSACTION_FILTER, {fromDate: new Date('2000-01-01 00:00:00 UTC')});
    txShow = <TransactionShowHeaders>{
        id: false,
        account: true,
        datePending: false,
        merchant: true,
        transactionType: true
    };
    editing: boolean = false;
    accountTypes = Account.Types();
    errors: string[] = [];
    #cacheUpdate?: Subscription;

    protected institutionsService = inject(InstitutionsService);
    protected accountsService = inject(AccountsService);

    constructor() {
        console.log('AccountDetailComponent constructor');
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

    parseCSVFiles($event: File[]) {
        const institution = this.institutionsService.get().byId(this.account.institutionId);
        if ( !institution ) {
            throw new Error(`Institution ${this.account.institutionId} not found.`);
        }
        Accounts.parseCSVFiles(this.account, $event, institution, this.errors).then((txns: Transactions) => {
            console.log('parseCSVFiles() txns: ', this.account, txns);
            this.account.transactions.add(...txns);
            this.account.transactions.sorted();
            this.accounts.byId(this.id)?.update(this.account);
            this.accountsService.save(this.accounts);
        }).catch((e) => {
            console.error('Error parsing CSV files', e);
            this.errors.push(<string>e);
        });
    }

    /**
     * Save the account changes.
     */
    save(): void {
        console.log('AccountDetailComponent() save()');
        this.accounts.byId(this.id)?.update(this.account);
        this.accountsService.save(this.accounts);
        this.editing = false;
    }

    /**
     * Cancel the account changes.
     */
    cancel(): void {
        console.log('AccountDetailComponent() cancel()');
        this.editing = false;
    }

    /**
     * Delete the account.
     */
    remove(): void {
        console.log('AccountDetailComponent() delete()');
        this.accounts.remove(this.id);
        this.accountsService.save(this.accounts);
        this.router.navigate(['/accounts']);
    }
}
