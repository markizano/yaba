import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

import { Accounts, Account } from 'app/lib/accounts';
import { FormMode } from 'app/lib/structures';
import { YabaAnimations } from 'app/lib/animations';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  providers: [ Location, { provide: LocationStrategy, useClass: PathLocationStrategy } ],
  animations: [
    YabaAnimations.fade()
  ]
})
export class AccountsComponent {
  // User feedback
  error?: string;
  location: Location;

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

  constructor( location: Location) {
    this.accounts = new Accounts();
    this.account = new Account();
    this.error = '';
    this.formVisible = false;
    this.formMode = FormMode.Create;
    this.location = location;
  }

  /**
   * Add a new account.
   */
  add(): void {
    this.formMode = FormMode.Create;
    this.formVisible = true;
    console.log(this);
  }

  /**
   * Navigate to the account detail page.
   * @param account {Account}
   */
  view(account: Account): void {
    // Navigate to the account route.
    const accountId = typeof account === 'object' ? account.id : account;
    location.href = `accounts/${accountId}`;
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
      this.accounts.push(account);
    } else if ( this.formMode == FormMode.Edit ) {
      this.accounts.byId(this.account.id)?.update(account);
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
