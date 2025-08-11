import { Subscription, Observer } from 'rxjs';

import { Injectable, EventEmitter } from '@angular/core';

import { Accounts } from 'app/lib/accounts';
import { Tags } from 'app/lib/types';

/**
 * Service for managing tags across all accounts and transactions.
 * Provides a centralized way to access and subscribe to tag updates.
 */
@Injectable({
  providedIn: 'root'
})
export class TagsService {
  protected tags: Tags = new Tags();
  protected tagsChange = new EventEmitter<Tags>();

  /**
   * Subscribe to tag updates
   */
  subscribe(subscription: Partial<Observer<Tags>> | ((value: Tags) => void)): Subscription {
    return this.tagsChange.subscribe(subscription);
  }

  /**
   * Update the cached tags and notify subscribers
   */
  next(value: Tags): void {
    this.tags = new Tags(value);
    this.tagsChange.emit(this.tags);
    console.log('TagsService: Tags updated', this.tags);
  }

  /**
   * Refresh tags from all accounts
   * This is an expensive operation that should be called when:
   * - CSV files are uploaded/dropped
   * - Transactions are bulk edited
   * - Account data is refreshed
   */
  refreshFromAccounts(accounts: Accounts): void {
    console.log('TagsService: Refreshing tags from accounts');
    this.next(accounts.getTags());
  }

  /**
   * Get a clone of the current cached tags.
   * Useful if you want to operate on the list, but not impact the cache.
   */
  get(): Tags {
    return this.tags;
  }
}
