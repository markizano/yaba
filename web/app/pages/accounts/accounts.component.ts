import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { EMPTY_TRANSACTION_FILTER } from 'app/lib/constants';
import { Accounts, Account } from 'app/lib/accounts';
import { AccountsService } from 'app/services/accounts.service';
import { InstitutionsService } from 'app/services/institutions.service';
import { Transactions } from 'app/lib/transactions';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
})
export class AccountsComponent {
    accounts = new Accounts();
    account = new Account();
    tview: Transactions[] = [];

    // Form controls.
    formVisible = false;
    filters = EMPTY_TRANSACTION_FILTER;
    errors: string[] = [];

    #cacheUpdate?: Subscription;

    constructor( protected router: Router, protected institutionsService: InstitutionsService, protected accountsService: AccountsService) {
        console.log('new AccountsComponent()');
        this.filters.fromDate = new Date('2000-01-01 00:00:00 UTC');
    }

    ngOnInit() {
        console.log('AccountsComponent().ngOnInit()');
        const update = (accounts: Accounts) => {
            console.log('AccountsComponent().#sub.update()');
            this.accounts = Accounts.fromList(accounts);
            this.tview = accounts.map((a) => a.transactions.sorted().sample());
        };
        update(this.accountsService.get());
        this.#cacheUpdate = this.accountsService.subscribe(update);
    }

    ngOnDestroy() {
        console.log('AccountsComponent().ngOnDestroy()');
        this.#cacheUpdate?.unsubscribe();
    }

    /**
     * Add a new account.
     */
    add(): void {
        this.formVisible = true;
    }

    /**
     * Edit an existing account handler.
     * @param account {Account} The account to edit.
     */
    edit(account: Account): void {
        this.account.update(account);
        this.formVisible = true;
    }

    /**
     * Remove the account.
     * @param account {Account} The account to remove.
     */
    remove(account: Account): void {
        console.log(`AccountsComponent().remove(${account.id})`);
        this.accounts.remove(account.id);
        this.accountsService.save(this.accounts);
    }

    /**
     * Save changes to the account list.
     */
    save(account: Account): void {
        const oldaccount = this.accounts.byId(account.id);
        if ( oldaccount ) {
            oldaccount.update(account);
        } else {
            this.accounts.add(account);
        }
        this.accountsService.save(this.accounts);
        this.close();
        this.reset();
    }

    /**
     * User clicked cancel button.
     */
    cancel(): void {
        this.close();
        this.reset();
    }

    /**
     * Close the form.
     */
    close(): void {
        this.formVisible = false;
    }

    /**
     * Close the form.
     */
    reset(): void {
        this.account = new Account();
    }

    /**
     * Parse the CSV file dropped on this account table.
     * Because this function is used in both account details and account listing page,
     * it's attached to the Accounts class.
     */
    async parseCSVFiles(account: Account, $event: File[]) {
        const institution = this.institutionsService.get().byId(account.institutionId);
        if ( institution === undefined ) {
            throw new Error(`Institution not found for account: ${account.id}`);
        }
        const txns = await Accounts.parseCSVFiles(account, $event, institution, this.errors);
        console.log('AccountsComponent().parseCSVFiles() txns: ', txns);
        account.transactions.add(...txns);
        console.debug('AccountsComponent().parseCSVFiles() saving accounts: ', this.accounts);
        this.save(account);
    }
}
