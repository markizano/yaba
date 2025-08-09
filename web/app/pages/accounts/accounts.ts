import { Component, inject, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';

import { Accounts, Account } from 'app/lib/accounts';
import { AccountsService } from 'app/services/accounts.service';
import { InstitutionsService } from 'app/services/institutions.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.html',
  styleUrls: ['./accounts.css'],
  standalone: false,
})
export class AccountsComponent implements OnInit, OnDestroy {
  /**
   * Inject services to subscribe to and save account and institution updates.
   */
  institutionsService = inject(InstitutionsService);
  accountsService = inject(AccountsService);

  /**
   * Buckets to hold accounts and active account.
   */
  accounts = new Accounts();
  account = new Account();

  /**
   * Form visibility.
   */
  formVisible = false;

  /**
   * Display user errors.
   */
  errors: string[] = [];

  /**
   * Private subscription placeholder.
   * @TODO: Migrate to the HTML template `async` pipe.
   */
  #accts?: Subscription;

  ngOnInit() {
    console.log('AccountsComponent().ngOnInit()');
    const update = (accounts: Accounts) => {
      console.log('AccountsComponent().#sub.update()');
      this.accounts = accounts;
    };
    update(this.accountsService.get());
    this.#accts = this.accountsService.subscribe(update);
  }

  ngOnDestroy() {
    console.log('AccountsComponent().ngOnDestroy()');
    this.#accts?.unsubscribe();
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
    console.log('AccountsComponent().save()', account);
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
  async parseCSVFiles(account: Account, $event: File[]): Promise<void> {

    try {
      const institution = this.institutionsService.get().byId(account.institutionId);
      if ( !institution ) {
        throw new Error(`Institution not found for account: ${account.id}`);
      }
      const txns = await Accounts.parseCSVFiles(account, $event, institution, this.errors);
      Accounts.receiveParsedTransactions(account, txns);
      this.save(account);
      this.accountsService.save(this.accounts);

    } catch (e) {
      console.error('Error parsing CSV files', e);
      this.errors.push(<string>e);
    }
  }
}
