import { Subscription, Observer } from 'rxjs';
import { Injectable, EventEmitter } from '@angular/core';

import { Accounts } from 'app/lib/accounts';
import { Tags } from 'app/lib/types';

/**
 * Service for managing budget tags across all accounts and transactions.
 * Provides a centralized way to access and subscribe to tag updates.
 */
@Injectable({
  providedIn: 'root'
})
export class BudgetsService {
  protected cache: Tags = new Tags();
  protected cacheSubject = new EventEmitter<Tags>();

  constructor() {
    console.log('new BudgetsService()');
  }

  /**
   * Subscribe to tag updates
   * @param subscription {Partial<Observer<Tags>> | ((value: Tags) => void)} Subscription to the cache.
   * @returns {Subscription} The subscription object.
   */
  subscribe(subscription: Partial<Observer<Tags>> | ((value: Tags) => void)): Subscription {
    return this.cacheSubject.subscribe(subscription);
  }

  /**
   * Update the cached tags and notify subscribers
   */
  next(value: Tags): void {
    this.cache = new Tags(value); //Array.from(new Set(value)) as Tags;
    this.cacheSubject.emit(this.cache);
    console.log('BudgetsService: Tags updated', this.cache);
  }

  /**
   * Refresh tags from all accounts
   * This is an expensive operation that should be called when:
   * - CSV files are uploaded/dropped
   * - Transactions are bulk edited
   * - Account data is refreshed
   */
  refreshFromAccounts(accounts: Accounts): void {
    console.log('BudgetsService: Refreshing tags from accounts');
    this.next(accounts.getTags());
  }

  /**
   * Get a clone of the current cached tags.
   * Useful if you want to operate on the list, but not impact the cache.
   */
  get(): Tags {
    return this.cache;
  }
}
