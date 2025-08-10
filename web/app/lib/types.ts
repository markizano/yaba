import { PageEvent } from '@angular/material/paginator';

import { Account, Accounts } from "app/lib/accounts";
import { Institution, Institutions } from "app/lib/institutions";
import { Transaction, Transactions } from "app/lib/transactions";

export type Yabable = Transaction | Account | Institution;
export type Yabables = Transactions | Accounts | Institutions;

/**
 * Interface all plural yaba-able objects must implement.
 */
export type YabaPlural<T> = Array<T> & {
    id2name: Id2NameHashMap;
    add(...items: T[]): YabaPlural<T>;
    remove(ID: T|string): YabaPlural<T>;
    clear(): YabaPlural<T>;
    byId(ID: string): T|undefined;
};

/**
 * NgSelectable Struct for rendering select contents.
 */
export type NgSelectable<T> = { label: string, value: T };

/**
 * @type {DateRange} DateRange Object to represent a range of dates.
 */
export type DateRange = { fromDate: Date, toDate: Date };

/**
 * @type {Id2NameHashMap} Yabable.id:Yabable.name mapping for quick lookups.
 */
export type Id2NameHashMap = { [key: string]: string };

/**
 * Description cab be either a string or a regular expression.
 * @edit: I learned that regex as a type passed along does not work as well as I thought.
 * The data structure goes better as a struct with the string and the boolean attached as a unit.
 */
export type Description = string | RegExp;

/**
 * Description + Regexp Struct for sending description update change events.
 */
export type DescriptionChange = {
    description: Description;
    useRegexp: boolean;
};

/**
 * Used in settings and txn-list to determine which headers/columns to show.
 */
export type TransactionShowHeaders = {
    id: boolean;
    datePending: boolean;
    account: boolean;
    transactionType: boolean;
    merchant: boolean;
    tax: boolean;
    tags: boolean;
};

/**
 * Annotation type for a transaction type.
 */
export enum TransactionType {
    UNKNOWN = 'unknown', // Treated equivalant to `null`.
    Credit = 'credit',
    Debit = 'debit',
    Transfer = 'transfer',
    Payment = 'payment',
};

/**
 * So this has evolved into a fixed Set.
 *
 */
// export type Tags = string[];
export class Tags extends Set<string> {
  static from(tags: string[]): Tags {
    return new Tags(tags.sort());
  }

  override toString(sep: string = '|'): string {
    return this.toArray().join(sep);
  }

  toArray(): string[] {
    return Array.from(this);
  }

  clone(): Tags {
    return new Tags(this);
  }

  /**
   * Take another instance of Tags and attempt to mesh them together.
   * @param {Tags} tags Another instance of Tags to merge.
   * @return {Tags} A unique list of tags among the two.
   */
  merge(tags: Tags): void {
    const current = this.clone();
    tags.toArray().forEach(tag => {
      if ( !current.has(tag) && tag ) {
        current.add(tag);
      }
    });
    this.clear();
    current.toArray().sort().forEach(tag => this.add(tag))
  }

  /**
   * Take another instance of Tags and attempt to strip members.
   * @param {Tags} tags Another instance of Tags to strip.
   * @return {Tags} A unique list of tags with the members stripped.
   */
  strip(tags: Tags): void {
    const current = this.clone();
    tags.toArray().forEach(tag => {
      if ( current.has(tag) ) {
        current.delete(tag);
      }
    });
    this.clear();
    current.toArray().sort().forEach(tag => this.add(tag))
  }

  // The following functions are array wrapper methods.
  // They were added as a result of changing the data type from Array to Set.

  /**
   * Get the lenght/size of the Set.
   */
  get length(): number {
    return this.size;
  }

  /**
   * Alias for Set.has().
   */
  includes(tag: string): boolean {
    return this.has(tag);
  }

  /**
   * Alias for Set.add(), but maintains sort.
   */
  push(tag: string): void {
    if (!this.has(tag)) {
      const sorted = [...this, tag].sort();
      this.clear();
      sorted.forEach(t => this.add(t));
    }
  }

  /**
   * Alias for Array.filter()
   */
  filter(predicate: (value: string, index: number, tags: string[]) => string[]): Tags {
    return new Tags(this.toArray().filter(predicate, this));
  }

  /**
   * Alias for Array.some()
   */
  some(predicate: (value: string, index: number, tags: string[]) => boolean): boolean {
    return this.toArray().some(predicate, this)
  }

  /**
   * Alias for Array.map()
   */
  map(callbackFn: (value: string, index: number, tags: string[]) => unknown): unknown[] {
    return this.toArray().map(callbackFn, this);
  }

  /**
   * Alias for Array.join()
   */
  join(del?: string): string {
    return this.toArray().join(del);
  }
}

/**
 * Budget interface to define a budget.
 */
export type IBudget = { tag: string, amount: number };
export type Budgets = IBudget[];

/**
 * Transaction Sorting descriptor.
 */
export type TxnSortHeader = {
    column: keyof Transaction,
    asc: boolean
};

/**
 * Transaction Filter structure that helps us collect and transmit txn filter data across components.
 */
export type TransactionFilter = {
    fromDate: Date;
    toDate: Date;
    description: Description;
    accounts?: Account[]|Accounts;
    tags?: Tags;
    sort: TxnSortHeader;
    page: PageEvent;
    limit?: number;
};

