import { Account, Accounts } from "app/lib/accounts";
import { Institution, Institutions } from "app/lib/institutions";
import { Transaction, Transactions } from "app/lib/transactions";

export type Yabable = Transaction | Account | Institution;
export type Yabables = Transactions | Accounts | Institutions;

/**
 * Interface all plural yaba-able objects must implement.
 */
export type YabaPlural<T> = Array<T> & {
    add(...items: T[]): number;
    add<A>(...items: A[]): number;
    remove(ID: T|string): YabaPlural<T>;
    clear(): YabaPlural<T>;
    byId(ID: string): T|undefined;
};

/**
 * Special string array that represents a list of tags.
 * If we later want to expand on this, we can use this stub.
 */
export type Tags = string[];

/**
 * NgSelectable Struct for rendering select contents.
 */
export type NgSelectable<T> = { label: string, value: T };

/**
 * @type {DateRange} DateRange Object to represent a range of dates.
 */
export type DateRange = { fromDate: Date, toDate: Date };
