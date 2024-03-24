import { Component } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

import { Accounts, Account } from 'app/lib/accounts';
import { FormMode } from 'app/lib/structures';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: [ './accounts.component.css' ],
  providers: [ Location, { provide: LocationStrategy, useClass: PathLocationStrategy } ],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(600, style({opacity: 1}))
      ])
    ])
  ]
})
export class AccountsComponent {
  title = 'Accounts';
  error?: string;
  accounts: Accounts;
  account: Account;
  visible: boolean;
  mode: FormMode;
  Account: typeof Account = Account;

  constructor() {
    this.accounts = new Accounts();
    this.account = new Account();
    this.error = '';
    this.visible = false;
    this.mode = FormMode.Create;
  }

  /**
   * Add a new account.
   */
  add() {
    this.mode = FormMode.Create;
    this.visible = true;
    return true;
  }

  /**
   * Navigate to the account detail page.
   * @param account {Account}
   */
  view(account: Account) {
    // Navigate to the account route.
    const accountId = typeof account === 'object' ? account.id : account;
    location.href = `accounts/${accountId}`;
    
  }

  /**
   * Edit an existing account handler.
   * @param account {Account} The account to edit.
   */
  edit(account: Account) {
    this.account = account;
    this.mode = FormMode.Edit;
    this.visible = true;
  }

  /**
   * Remove the account.
   * @param account {Account} The account to remove.
   */
  remove(account: Account) {
    return this.accounts.remove(account.id);
    //@TODO: Fire save event.
  }
}
