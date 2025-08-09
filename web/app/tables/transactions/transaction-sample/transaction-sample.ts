import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Account, Accounts } from 'app/lib/accounts';
import { EMPTY_TRANSACTION_FILTER } from 'app/lib/constants';

import { TransactionFilter } from 'app/lib/types';
import { AccountsService } from 'app/services/accounts.service';

/**
 * This transaction sample component is only used in the account list page.
 * It requires an account ID.
 * It will override the filters to only display what is necessary (a sample 5 most recent transactions).
 * No pagination, no editing, no budgeting, no bells nor whistles.
 * Just 5 transactions for said account.
 */
@Component({
  selector: 'yaba-transaction-sample',
  standalone: false,
  templateUrl: './transaction-sample.html',
  styleUrl: './transaction-sample.css',
})
export class TransactionSampleComponent implements OnInit, OnDestroy {

  @Input({ required: true }) accountId!: string;
  accountsService: AccountsService = inject(AccountsService);
  account: Account = new Account();

  #acct?: Subscription;

  /**
   * The filters to apply to the transactions.
   */
  filters: TransactionFilter = Object.assign({}, EMPTY_TRANSACTION_FILTER, {
    fromDate: new Date('2000-01-01T00:00:00Z'),
    accounts: [],
  });

  ngOnInit(): void {
    // Subscribe to account service updates
    this.#acct = this.accountsService.subscribe((accounts) => {
      this.updateAccount(accounts);
    });

    // Initialize with current account data
    this.updateAccount(this.accountsService.get());
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.#acct) {
      this.#acct.unsubscribe();
    }
  }

  /**
   * Update the account and filters when accounts data changes
   */
  private updateAccount(accounts: Accounts): void {
    const foundAccount = accounts.byId(this.accountId);
    if (foundAccount) {
      this.account = foundAccount;
      // Update filters to include the updated account
      this.filters = Object.assign({}, EMPTY_TRANSACTION_FILTER, {
        fromDate: new Date('2000-01-01T00:00:00Z'),
        accounts: [this.account],
      });
    }
  }

  /**
   * @DEBUG only
   * Render the filters for us to see in the dashboard.
   */
  filtration(filters: TransactionFilter): string {
    return JSON.stringify({
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      description: filters.description,
      accounts: filters.accounts?.map(x => ({id: x.id, name: x.name})),
      tags: filters.tags,
      // sort: this.sort,
      page: filters.page,
    });
  }

}
