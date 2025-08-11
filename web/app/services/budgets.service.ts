import { Subscription, Observer } from 'rxjs';

import { Injectable, EventEmitter } from '@angular/core';

import { Accounts } from 'app/lib/accounts';
import { Budgets } from 'app/lib/types';
import { EMPTY_TRANSACTION_FILTER } from 'app/lib/constants';

/**
 * Service for managing budgets across all accounts and transactions.
 * Provides a centralized way to access and subscribe to budget updates.
 */
@Injectable({
  providedIn: 'root'
})
export class BudgetsService {
  protected budgets: Budgets = new Budgets();
  protected budgetsChange = new EventEmitter<Budgets>();

  /**
   * Subscribe to budget updates
   */
  subscribe(subscription: Partial<Observer<Budgets>> | ((value: Budgets) => void)): Subscription {
    return this.budgetsChange.subscribe(subscription);
  }

  /**
   * Update the cached budgets and notify subscribers
   */
  next(value: Budgets): void {
    this.budgets = value;
    this.budgetsChange.emit(this.budgets);
    console.log('BudgetsService: Budgets updated', this.budgets);
  }

  /**
   * Refresh budgets from all accounts
   * This is an expensive operation that should be called when:
   * - CSV files are uploaded/dropped
   * - Transactions are bulk edited
   * - Account data is refreshed
   */
  refreshFromAccounts(accounts: Accounts): void {
    console.log('BudgetsService: Refreshing budgets from accounts');
    const filters = {...EMPTY_TRANSACTION_FILTER};
    filters.fromDate = new Date('2000-01-01T00:00:00Z');
    this.next(accounts.getTransactions(filters).getBudgets());
  }

  /**
   * Get a clone of the current cached budgets.
   * Useful if you want to operate on the list, but not impact the cache.
   */
  get(): Budgets {
    return this.budgets;
  }
}
