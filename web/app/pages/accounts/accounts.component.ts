import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Accounts, Account } from 'app/lib/accounts';
import { FormMode } from 'app/lib/structures';
import { AccountsService } from 'app/services/accounts.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
})
export class AccountsComponent {
    // User feedback
    error?: string;

    // This really needs to be a service we can use to communicate with the filesystem.
    @Input() accounts: Accounts;
    @Output() accountsChange: EventEmitter<Accounts> = new EventEmitter<Accounts>();

    @Input() account: Account;
    @Output() accountChange: EventEmitter<Account> = new EventEmitter<Account>();

    // Form controls.
    formVisible: boolean;
    formMode: FormMode;

    // Access to class objects from within the templates.
    Account: typeof Account = Account;

    constructor( protected router: Router, protected accountsService: AccountsService) {
        console.log('new AccountsComponent()');
        this.accounts = new Accounts();
        this.account = new Account();
        this.error = '';
        this.formVisible = false;
        this.formMode = FormMode.Create;
    }

    ngOnInit() {
        // Load the accounts from the filesystem.
        console.log('AccountsComponent().ngOnInit()');
        // this.accountsService.loaded((accounts: Accounts) => {
        //     this.accounts.add(...accounts);
        //     console.log('AccountsComponent().ngOnInit() loaded accounts: ', accounts);
        // });
    }

    /**
     * Add a new account.
     */
    add(): void {
        this.formMode = FormMode.Create;
        this.formVisible = true;
    }

    /**
     * Navigate to the account detail page.
     * @param account {Account}
     */
    view(account: Account): void {
        // Navigate to the account route.
        const accountId = account instanceof Account ? account.id : account;
        this.router.navigate(['/account', accountId]);
    }

    /**
     * Edit an existing account handler.
     * @param account {Account} The account to edit.
     */
    edit(account: Account): void {
        this.account = account;
        this.formMode = FormMode.Edit;
        this.formVisible = true;
    }

    /**
     * Remove the account.
     * @param account {Account} The account to remove.
     */
    remove(account: Account): void {
        this.accounts.remove(account);
        this.accountChange.emit(this.account);
    }

    /**
     * Save changes to the account list.
     */
    save(account: Account): void {
        if ( this.formMode == FormMode.Create ) {
            this.accounts.add(account);
        }
        this.accountsChange.emit(this.accounts);
        this.formVisible = false;
    }

    /**
     * Close the form.
     */
    close(): void {
        this.formVisible = false;
        this.formMode = FormMode.Create;
        this.account = new Account();
    }
}
