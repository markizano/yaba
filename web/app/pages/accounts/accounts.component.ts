import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

import { Accounts, Account } from 'app/lib/accounts';
import { FormMode } from 'app/lib/structures';
import { AccountsService } from 'app/services/accounts.service';
import { Router } from '@angular/router';
import { EMPTY_TRANSACTION_FILTER } from 'app/lib/transactions';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
})
export class AccountsComponent {
    // User feedback
    errors: string[] = [];

    // This really needs to be a service we can use to communicate with the filesystem.
    @Input() accounts = new Accounts();
    @Output() accountsChange = new EventEmitter<Accounts>();

    @Input() account = new Account();
    @Output() accountChange = new EventEmitter<Account>();

    // Form controls.
    formVisible = false;
    formMode = FormMode.Create;
    filters = EMPTY_TRANSACTION_FILTER;

    #accountUpdate: Subscription;
    #cacheUpdate?: Subscription;

    constructor( protected router: Router, protected accountsService: AccountsService, protected chgDet: ChangeDetectorRef) {
        console.log('new AccountsComponent()');
        this.filters.fromDate = new Date('2000-01-01 00:00:00 UTC');
        this.#accountUpdate = this.accountsChange.subscribe((accounts: Accounts) => {
            this.accountsService.save(accounts).subscribe((response) => {
                console.log('Accounts saved: ', response);
            });
        });
    }

    ngOnInit() {
        console.log('AccountsComponent().ngOnInit()');
        const update = (accounts: Accounts) => {
            this.accounts = accounts;
            // this.chgDet.detectChanges();
        };
        update(this.accountsService.get());
        this.#cacheUpdate = this.accountsService.subscribe(update);
    }

    ngOnDestroy() {
        console.log('AccountsComponent().ngOnDestroy()');
        this.#accountUpdate.unsubscribe();
        this.#cacheUpdate?.unsubscribe();
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
        this.router.navigate(['/accounts', accountId]);
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
