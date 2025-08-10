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
    private cache: Tags = [];
    private cacheSubject = new EventEmitter<Tags>();

    constructor() {
        console.log('new BudgetsService()');
    }

    /**
     * Subscribe to tag updates
     */
    subscribe(callback: (tags: Tags) => void): void {
        this.cacheSubject.subscribe(callback);
    }

    /**
     * Update the cached tags and notify subscribers
     */
    next(value: Tags): void {
        this.cache = [...value];
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
        const allTags = accounts.getTags();
        this.next(allTags);
    }

    /**
     * Get the current cached tags
     */
    getTags(): Tags {
        return [...this.cache];
    }

    /**
     * Add new tags (useful when new transactions are added)
     */
    addTags(newTags: Tags): void {
        const currentTags = new Set(this.cache);
        let hasChanges = false;

        newTags.forEach(tag => {
            if (!currentTags.has(tag)) {
                currentTags.add(tag);
                hasChanges = true;
            }
        });

        if (hasChanges) {
            const updatedTags = Array.from(currentTags).sort();
            this.next(updatedTags);
        }
    }

    /**
     * Remove tags (useful when transactions are deleted or untagged)
     */
    removeTags(tagsToRemove: Tags): void {
        const currentTags = new Set(this.cache);
        let hasChanges = false;

        tagsToRemove.forEach(tag => {
            if (currentTags.has(tag)) {
                currentTags.delete(tag);
                hasChanges = true;
            }
        });

        if (hasChanges) {
            const updatedTags = Array.from(currentTags).sort();
            this.next(updatedTags);
        }
    }

    /**
     * Check if a tag exists
     */
    hasTag(tag: string): boolean {
        return this.cache.includes(tag);
    }

    /**
     * Get tags that match a pattern (useful for search/filtering)
     */
    getTagsMatching(pattern: string): Tags {
        const regex = new RegExp(pattern, 'i');
        return this.cache.filter(tag => regex.test(tag));
    }
}
