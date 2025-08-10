import { Subscription } from 'rxjs';

import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AccountsService } from 'app/services/accounts.service';
import { InstitutionsService } from 'app/services/institutions.service';
import { Account, Accounts } from 'app/lib/accounts';
import { Transactions } from 'app/lib/transactions';

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
export class AccountDetailComponent implements OnInit, OnDestroy {
  /**
   * Inject the activated route to tell which account ID we are viewing.
   */
  route = inject(ActivatedRoute);

  /**
   * Inject the router to navigate to the account list page when done here.
   */
  router = inject(Router);

  /**
   * Inject services for global subscriptions.
   */
  institutionsService = inject(InstitutionsService);
  accountsService = inject(AccountsService);

  /**
   * The account ID we are viewing.
   */
  id: string|null = null;

  /**
   * Local container for accounts.
   */
  accounts = new Accounts();

  /**
   * Display figure for current account we are viewing.
   */
  account = new Account();

  /**
   * Account detail page errors to render.
   */
  errors: string[] = [];

  /**
   * Internal check to tell if we are editing this account.
   */
  editing: boolean = false;

  /**
   * Private subscription to account changes.
   * @TODO: use async where possible instead of this.
   */
  #acct?: Subscription;

  ngOnInit() {
    console.log('AccountDetailComponent() ngOnInit()');
    this.id = this.route.snapshot.paramMap.get('id');
    const update = (accounts: Accounts) => {
      this.errors.length = 0;
      this.accounts = accounts;
      try {
        if ( !this.id ) {
          throw new Error('No account ID?');
        }
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
    this.#acct = this.accountsService.subscribe(update);
  }

  /**
   * Clean up the subscriptions.
   */
  ngOnDestroy() {
      console.log('AccountDetailComponent() ngOnDestroy()');
      this.#acct?.unsubscribe();
  }

  /**
   * Attempt to parse the CSV file based on the institution description.
   */
  async parseCSVFiles($event: File[]): Promise<void> {
    try {
      const institution = this.institutionsService.get().byId(this.account.institutionId);
      if ( !institution ) {
          throw new Error(`Institution ${this.account.institutionId} not found.`);
      }
      const txns = await Accounts.parseCSVFiles(this.account, $event, institution, this.errors);
      Accounts.receiveParsedTransactions(this.account, txns);
      // Somehow this.account is not byReference, but byValue.
      // Need to search and update the original reference.
      this.accounts.byId(this.account.id)?.update(this.account);
      this.accountsService.save(this.accounts);

    } catch (e) {
      console.error('Error parsing CSV files', e);
      this.errors.push(<string>e);
    }
  }

  /**
   * Save the account changes.
   */
  save(): void {
    console.log('AccountDetailComponent() save()');
    if ( !this.id ) {
      throw new Error('No account ID?');
    }
    this.accounts.byId(this.id)?.update(this.account);
    this.accountsService.save(this.accounts);
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
    if ( !this.id ) {
      throw new Error('No account ID?');
    }
    this.accounts.remove(this.id);
    this.accountsService.save(this.accounts);
    this.router.navigate(['/accounts']);
  }
}
