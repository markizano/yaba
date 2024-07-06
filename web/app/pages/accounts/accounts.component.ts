import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { EMPTY_TRANSACTION_FILTER } from 'app/lib/constants';
import { Accounts, Account } from 'app/lib/accounts';
import { AccountsService } from 'app/services/accounts.service';
import { InstitutionsService } from 'app/services/institutions.service';
import { Institution } from 'app/lib/institutions';
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

    constructor( protected router: Router, protected chgDet: ChangeDetectorRef, protected institutionsService: InstitutionsService, protected accountsService: AccountsService) {
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
        this.account = account;
        this.formVisible = true;
    }

    /**
     * Remove the account.
     * @param account {Account} The account to remove.
     */
    remove(account: Account): void {
        this.accounts.remove(account);
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
        this.formVisible = false;
        this.accountsService.save(this.accounts);
    }

    /**
     * Close the form.
     */
    close(): void {
        this.formVisible = false;
        this.account = new Account();
    }

    /**
     * Parse the CSV file dropped on this account table.
     * Because this function is used in both account details and account listing page,
     * it's attached to the Accounts class.
     */
    async parseCSVFiles(account: Account, $event: File[]) {
        const txns = await Accounts.parseCSVFiles(account, $event, <Institution>this.institutionsService.get().byId(account.institutionId), this.errors);
        console.log('AccountsComponent().parseCSVFiles() txns: ', txns);
        account.transactions.add(...txns);
        console.debug('AccountsComponent().parseCSVFiles() saving accounts: ', this.accounts);
        this.save(account);
    }
}
