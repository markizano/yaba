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


