
import { v4 } from 'uuid';
import * as JSZip from 'jszip';
import * as Papa from 'papaparse';
import { NULLDATE, TransactionDeltas, CurrencyType } from 'app/lib/structures';
import { IAccount, Account, Accounts } from 'app/lib/accounts';
import { IInstitution, InstitutionMappings, MapTypes, IMapping } from 'app/lib/institutions';
import { Tags, YabaPlural } from 'app/lib/types';

/**
 * Annotation type for a transaction type.
 */
export enum TransactionType {
    UNKNOWN = 'unknown', // Treated equivalant to `null`.
    Credit = 'credit',
    Debit = 'debit',
    Transfer = 'transfer',
    Payment = 'payment',
}

/**
 * @enum List of top-level member fields that represent a transaction.
 */
export type TransactionFields = keyof ITransaction & string | 'UNKNOWN';

/**
 * Transaction interface to define a transaction.
 */
export interface ITransaction {
    readonly UNKNOWN: string; // TS hack to make 'UNKNOWN' work as a member.
    id: string;
    accountId: string;
    description: string;
    datePending: Date;
    datePosted: Date;
    transactionType: TransactionType;
    amount: number;
    tax: number;
    currency: CurrencyType;
    merchant: string;
    tags: Tags;
}

/**
 * Budget interface to define a budget.
 */
export type IBudget = { tag: string, amount: number };
export type Budgets = IBudget[];

/**
 * Transaction Sorting descriptor.
 */
export interface TxnSortHeader {
    column: TransactionFields;
    asc: boolean;
}

/**
 * Transaction Filter structure that helps us collect and transmit txn filter data across components.
 */
export interface TransactionFilter {
    fromDate: Date;
    toDate: Date;
    description: string|RegExp;
    budgets: Budgets;
    accounts: Account[]|Accounts;
    limit: number;
    tags?: Tags;
    sort: TxnSortHeader
}

/**
 * Placeholders for editing transactions.
 */
export interface EditPlaceholder {
    datePending: boolean;
    datePosted: boolean;
    amount: boolean;
    description: boolean;
    merchant: boolean;
    transactionType: boolean;
    tags: boolean;
}

abstract class aTransaction implements ITransaction {
    abstract readonly UNKNOWN: string; // TS hack to make 'UNKNOWN' work as a member.
    abstract id: string;
    abstract accountId: string;
    abstract description: string;
    abstract datePending: Date;
    abstract datePosted: Date;
    abstract transactionType: TransactionType;
    abstract amount: number;
    abstract tax: number;
    abstract currency: CurrencyType;
    abstract merchant: string;
    abstract tags: Tags;

    abstract update(data: ITransaction): Transaction;
    abstract hasTag(tag: string): boolean;
    abstract setTag(tag: string): Transaction;
    abstract addTag(tag: string): Transaction;
    abstract removeTag(tag: string): Transaction;
    abstract YYYYMM(): string;

}

/**
 * Data model object to represent a transaction.
 * Coerces a Hash/Object into something we can use as institution to at least typecast the
 * structure as we need it here.
 * Also performs typecasting to ensure we have Date() object for date related fields and
 * Number() types for numeric fields, etc.
 */
export class Transaction extends aTransaction implements ITransaction {
    readonly UNKNOWN = 'unknown'; // TS hack to make 'UNKNOWN' work as a member.
    public id: string;
    public accountId: string;
    public description: string;
    public datePending: Date;
    public datePosted: Date;
    public transactionType: TransactionType;
    public amount: number;
    public tax: number;
    public currency: CurrencyType;
    public merchant: string;
    public tags: Tags;

    constructor(id?: string,
      accountId?: string,
      description?: string,
      datePending?: Date,
      datePosted?: Date,
      transactionType?: TransactionType,
      amount?: number,
      tax?: number,
      currency?: CurrencyType,
      merchant?: string,
      tags?: Tags) {
        super();
        this.id = id || v4();
        this.accountId = accountId || '';
        this.description = description || '';
        this.datePending = datePending || NULLDATE;
        this.datePosted = datePosted || NULLDATE;
        this.transactionType = transactionType || TransactionType.UNKNOWN;
        this.amount = amount || 0.0;
        this.tax = tax || 0.0;
        this.currency = currency || CurrencyType.USD;
        this.merchant = merchant || '';
        this.tags = tags || <Tags>[];
    }

    /**
     * Load a given data object into this object.
     * @param {ITransaction} data Data object to load.
     * @return {Transaction} Chainable object.
     */
    public update(data: ITransaction): Transaction {
        data.id                 && (this.id = data.id);
        data.accountId          && (this.accountId = data.accountId);
        data.description        && (this.description = data.description);
        data.transactionType    && (this.transactionType = data.transactionType);
        data.amount             && (this.amount = data.amount);
        data.tax                && (this.tax = data.tax);
        data.currency           && (this.currency = data.currency);
        data.merchant           && (this.merchant = data.merchant);
        data.tags               && (this.tags = data.tags);
        if ( data.datePending && data.datePending != NULLDATE ) this.datePending = data.datePending;
        if ( data.datePosted  && data.datePosted  != NULLDATE ) this.datePosted  = data.datePosted;
        return this;
    }

    /**
     * Check to see if this transaction is of a given tag.
     * @param {string} tag Check to see if this transaction has a this given tag.
     * @returns {boolean} whether we have this tag or not.
     */
    public hasTag(tag: string): boolean {
        return this.tags.includes(tag);
    }

    /**
     * Ensure a tag is set on this transaction.
     * @param {String} tag Name of the tag to ensure is set.
     * @returns {Transaction}
     */
    public setTag(tag: string): Transaction {
        if ( ! this.hasTag(tag) ) {
            this.addTag(tag);
        }
        return this;
    }

    /**
     * Blindly add a new tag.
     * @param {String} tag Name of the tag to add.
     * @returns {Transaction}
     */
    public addTag(tag: string): Transaction {
        this.tags.push(tag);
        return this;
    }

    /**
     * Removes a tag from this transaction if it is set.
     * @param {String} tag The tag in question to ensure is removed.
     * @returns {Transaction}
     */
    public removeTag(tag: string): Transaction {
        if ( this.hasTag(tag) ) {
            this.tags = this.tags.filter(t => t != tag);
        }
        return this;
    }

    /**
     * Get the YYYYMM representation of this transaction for date categorization.
     * @returns {String}
     */
    public YYYYMM(): string {
        return this.datePosted.toISOShortDate().split('-', 2).join('-');
    }
}

/**
 * Array of transactions.
 * This is a wrapper around the Array class to ensure that we only ever contain a list of Transactions.
 * This is to ensure that we can typecast the array as a whole and not have to worry about typecasting
 * each individual item in the array.
 * @extends Array<Transaction>
 * @constructor {Transactions} Array of transactions. Can be initialized with an array of transactions.
 *   If the array contains objects, they will be converted to Transaction objects.
 *   If the array contains Transaction objects, they will be left as is.
 * @param {ITransaction[]} items Items to initialize the array with.
 * @returns {Transactions} Array of transactions.
 */
export class Transactions extends Array<Transaction> implements YabaPlural<ITransaction> {

    constructor(...items: Transaction[]) {
        if ( items.length > 0 && typeof items[0] !== 'number' ) {
            for ( const i in items ) {
                const item = items[i];
                if ( ! ( item instanceof Transaction ) ) {
                    const txn = new Transaction();
                    txn.update(item);
                    items[i] = txn;
                }
            }
        }
        super(...items);
    }

    /**
     * Override of the push() function to ensure that each item added to the array is of type `Transaction`.
     * @param  {...ITransaction} items 
     * @returns Number of items in the current set/array.
     */
    add<Txn>(...items: Txn[]): number;
    add(...items: Transaction[]): number {
        for ( const i in items ) {
            const item = new Transaction();
            items[i] instanceof Transaction || (items[i] = item.update(items[i]));
        }
        return super.push(...items);
    }

    /**
     * Override of unshift() to check if item added is an instance of a Transaction() or not
     * to ensure we only ever contain a list of Transactions.
     * @param  {...any} items Any list of arguments of items to add as Transaction()
     * @returns Number of items unshift()ed.
     */
    public override unshift(...items: Transaction[]): number {
        for (const i in items) {
            const item = new Transaction();
            items[i] instanceof Transaction || (items[i] = item.update(items[i]));
        }
        return super.unshift(...items);
    }

    /**
     * Override the filter() method to ensure we return Transactions instead of Array<Transaction>.
     * @param {Function} predicate Callback function to filter the array.
     * @param {any} thisArg Context to use for the callback function.
     * @returns {Transactions} New array of Transactions.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    public search(callback: Function, thisArg?: any): Transactions {
        const overrideCallback = (value: ITransaction, index: number, txns: Transaction[]): boolean => {
            return callback(value, index, new Transactions(...txns));
        };
        return new Transactions(...this.filter(overrideCallback, thisArg));
    }

    /**
     * Override the map() method to ensure we return Transactions instead of Array<Transaction>.
     * @param {Function} callback Callback function to map the array.
     * @param {any} thisArg Context to use for the callback function.
     * @returns {Transactions} New array of Transactions.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    public it(callback: Function, thisArg?: any): Transactions {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const overrideCallback = (value: ITransaction, index: number, txns: Transaction[]): any => {
            return callback(value, index, new Transactions(...txns));
        };
        return new Transactions(...this.map(overrideCallback, thisArg));
    }

    /**
     * Removes an item from this collection. Easier to understand than [].splice() since
     * we are using the ID field.
     * @param ID The ID field to remove.
     * @returns New Mutated array no longer containing the transaction.
     */
    remove(ID: string|ITransaction): Transactions {
        for ( const i in this ) {
            if ( typeof i !== 'number' ) continue;
            const item = this[i];
            if ( ID instanceof Transaction && item.id == ID.id ) {
                this.splice(i, 1);
            } else if (typeof ID === 'string' && item.id == ID) {
                this.splice(i, 1);
            }
        }
        return this;
    }

    /**
     * Clears the set of transactions.
     */
    clear(): Transactions {
        this.length = 0;
        return this;
    }

    /**
     * Produce a CSV result of the contents of this object.
     * @returns {String} CSV string of the contents of this object.
     * @todo Figure out how to stream results rather than buffering in-memory.
     */
    public toCSV(): string {
        if ( this.length == 0 ) {
            return '';
        }
        const transactionsZIP = ['"id","accountId","description","datePending","datePosted"' +
            ',"transactionType","amount","tax","currency","merchant","tags"'];
        this.forEach(transaction => {
            const tFields = [
                transaction.id,
                transaction.accountId,
                transaction.description,
                transaction.datePending.toISOShortDate(),
                transaction.datePosted.toISOShortDate(),
                transaction.transactionType,
                transaction.amount,
                transaction.tax,
                transaction.currency,
                transaction.merchant,
                transaction.tags.join("|")
            ];
            transactionsZIP.push(`"${tFields.join('","')}"`);
        });
        return transactionsZIP.join("\n");
    }

    /**
     * From a CSV file, import transactions into this collection.
     * @param {JSZip} jszip JSZip Instance
     */
    public async fromZIP(accountId: string, jszip: JSZip): Promise<Transactions> {
        // this.clear(); // @TODO: restore this from the old version
        const papaOpts = { header: true, skipEmptyLines: true };
        const transactionCSV = await jszip.files[`transactions_${accountId}.csv`].async('text');
        const parsedTransactions = Papa.parse(transactionCSV, papaOpts);
        this.add(...parsedTransactions.data.map(txn => {
            const result = new Transaction();
            result.update(<ITransaction>txn);
            return result;
        }));
        return this;
    }

    /**
     * From a JSON stringified object load them into a new instance of this collection.
     * @param {String} loadString JSON string to load.
     * @returns {Transactions} New instance of Transactions.
     */
    static fromString(loadString: string): Transactions {
        return new Transactions(...JSON.parse(loadString));
    }

    /**
     * Get the list of tags we have for this transaction collection.
     * @returns {Array<String>} List of tags associated with this collection of transactions.
     */
    public getTags(): string[] {
        const tagCollection: string[] = this.map(txn => txn.tags).flat().sort();
        return Array.from( new Set(tagCollection) );
    }

    /**
     * Filter method for returning the date range specified.
     * @param {Transaction} txn The transaction for the filter iteration
     * @returns {Boolean} TRUE|FALSE based on if this txn is in the specified date range.
     */
    public filterDaterange(txn: ITransaction, fromDate: Date, toDate: Date): boolean {
        const recent = txn.datePosted.getTime() >= fromDate.getTime();
        const older = txn.datePosted.getTime() <= toDate.getTime();
        return recent && older;
    }

    /**
     * Filters out based on accountId even if what is provided is more than just a string.
     * @param {Transaction} txn Transaction by this.filter() function.
     * @param {string|Account} accountId Account ID to filter against.
     * @returns {boolean} TRUE|FALSE if we find this in the description.
     */
    public filterAccountId(txn: ITransaction, accountId: string|IAccount): boolean {
        return txn.accountId == (accountId instanceof Account? accountId.id: accountId);
    }

    /**
     * Filters out based on a list or collection of accountIds even if what is provided is more than just a string.
     * @param {Transaction} txn Transaction by this.filter() function.
     * @param {string|Account} accountIds Account ID to filter against.
     * @returns {boolean} TRUE|FALSE if we find this in the description.
     */
    public filterAccountIds(txn: ITransaction, accountIds: string[]|Accounts): boolean {
        return accountIds.includes(txn.accountId);
    }

    /**
     * Filter by description.
     * @param {Transaction} txn Transaction by this.filter() function.
     * @param {String|RegExp|undefined} description String description to filter against. Will match in .merchant or in .description.
     * @returns {Boolean} TRUE|FALSE if we find this in the description.
     */
    public filterDescription(txn: ITransaction, description: string|RegExp): boolean {
        // Assign as booleans to check if any in match.
        if ( description instanceof String ) {
            const inMerchant = txn.merchant.toLowerCase().indexOf(description.toLowerCase()) !== -1;
            const inDescription = txn.description.toLowerCase().indexOf(description.toLowerCase()) !== -1;
            return inMerchant || inDescription;
        } else if ( description instanceof RegExp ) {
            const inMerchant = description.test(txn.merchant);
            const inDescription = description.test(txn.description);
            return inMerchant || inDescription;
        } else {
            return false;
        }
    }

    /**
     * Check to see if tag is attached to this transaction.
     * @param {Transaction} txn Transaction as provided by this.filter();
     * @param {String|undefined} tag The tag to match against.
     * @returns TRUE|FALSE for `this.filter()` use on if this tag exists on this transaction or not.
     */
    public filterTag(txn: ITransaction, tag: string|undefined): boolean {
        return txn.tags.includes(tag || '');
    }

    /**
     * Check to see if the collection of tags is attached to this transaction. Match ANY.
     * @param {Transaction} txn Transaction as provided by this.filter();
     * @param {Array<String>|undefined} tags The tags to match against.
     * @returns TRUE|FALSE for `this.filter()` use on if this tag exists on this transaction or not.
     */
    public filterTags(txn: ITransaction, tags: string[]|undefined): boolean {
        return txn.tags.some((tag) => tags === undefined? true: tags.includes(tag || ''));
    }

    /**
     * Filters out transactions by date. Gives a Transaction collection
     * within a time range between two dates.
     * @param {Date} fromDate No transactions older than this date.
     * @param {Date} toDate No transactions newer than this date.
     * @returns {Transactions}
     */
    public daterange(fromDate: Date, toDate: Date): Transactions {
        return this.search((txn: ITransaction) => this.filterDaterange(txn, fromDate, toDate));
    }

    /**
     * Gimmie this transaction by ID.
     * Since the ID is unique, this will only ever return 1 element.
     * @param {String} ID The transaction.id we want to find.
     * @returns {Transaction} The transaction object by reference.
     */
    public byId(ID: string): Transaction|undefined {
        return this.filter(txn => txn.id == ID).shift() || undefined;
    }

    /**
     * In the case that we have multiple accounts transactions in this collection,
     * this allows us to filter them out so we only have transactions of a specific
     * accountId.
     * @param {uuid.v4} accountId The account ID to filter.
     * @returns {Transactions} List of transactions only by accountId
     */
    public byAccountId(accountId: string|Account): Transactions {
        return this.search((txn: Transaction) => this.filterAccountId(txn, accountId));
    }

    /**
     * In the case that we have multiple accounts transactions in this collection,
     * this allows us to filter them out so we only have transactions of a specific
     * accountId.
     * @param {uuid.v4} accountIds The account ID to filter.
     * @returns {Transactions} List of transactions only by accountId
     */
    public byAccountIds(accountIds: string[]): Transactions {
        return this.search((txn: Transaction) => this.filterAccountIds(txn, accountIds));
    }

    /**
     * Gets a list of transactions that match the description.
     * @param {String|RegExp} description The description to match against.
     * @returns {Transactions} The list of matching transactions.
     */
    public byDescription(description: string|RegExp): Transactions {
        return this.search((txn: Transaction) => this.filterDescription(txn, description));
    }

    /**
     * Filter the list of transactions by tag.
     * @param {String} tag Filter the list of transactions by tag.
     * @returns {Transactions} The list of matching transactions.
     */
    public byTag(tag: string): Transactions {
        return this.search((txn: Transaction) => this.filterTag(txn, tag || ''));
    }

    /**
     * Filter the list of transactions by a collection of matching tags.
     * @param {Array} tags Filter the list of transactions by a set of tags.
     * @returns {Transactions} The list of matching transactions.
     */
    public byTags(tags: string[]): Transactions {
        return this.search((txn: Transaction) => this.filterTags(txn, tags || []));
    }

    /**
     * In place mutation method to set a tag across all the selected transactions in this collection.
     * @param {String} tag The Tag to associate with all these transactions.
     * @returns {Transactions} Updated copy of transactions with this tag set on all of them.
     */
    public setTag(tag: string): Transactions {
        return this.it((txn: Transaction) => txn.setTag(tag));
    }

    /**
     * Removes a tag from this transaction if it is set.
     * @returns {Transaction}
     */
    public removeTag(tag: string): Transactions {
        return this.it((txn: Transaction) => txn.removeTag(tag));
    }

    /**
     * Get me a copy of transactions that have a tag, any tag set.
     * @returns {Transactions} new list of transactions that have a tag set.
     */
    public haveTags(): Transactions {
        return this.search((t: Transaction) => t.tags.length > 0);
    }

    /**
     * Reduce this set of transactions down to get the list of budgets in alpha order with
     * transaction amounts associated with them.
     * @returns {Array<IBudget>} List of budgets to render in the widget.
     * For example, for each transaction that has a "Grocery" tag on it, it will be sum()d up
     * and result as a single {"Groceries": $amount} object in the resulting Array().
     */
    public getBudgets(): IBudget[] {
        // Map each transaction to a {tag, amount} object.
        const tag2amount = (t: ITransaction) => t.tags.map(tag => ({tag, amount: t.amount}) );
        // Sort by tag near the end of this operation.
        const sortByTags = (a: IBudget, b: IBudget) => a.tag.toLowerCase() > b.tag.toLowerCase()? 1: -1;
        // Reducer method for filtering out duplicates into a unique
        // list of budgets with the amounts aggregated.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sumTags = (budgets: any, txn: any): IBudget[] => {
            txn.forEach((cv: IBudget) => {
                const a = budgets.filter((x: IBudget) => x.tag == cv.tag);
                if ( a.length ) {
                    a[0].amount += cv.amount;
                } else {
                    budgets.push(cv);
                }
            });
            return budgets;
        };
        // Run this rube-goldberg and haphazardly return the result.
        switch ( this.length ) {
            case 0:
                return [];
            case 1:
                return (txn => {
                    if ( txn.tags.length ) {
                        return txn.tags.map(tag => ({tag, amount: txn.amount}));
                    }
                    return [];
                })(this[0])
            default:
                // eslint-disable-next-line no-case-declarations
                const txnsWithTags = this.haveTags();
                // eslint-disable-next-line no-case-declarations
                const tags2Amounts = txnsWithTags.map(tag2amount);
                // eslint-disable-next-line no-case-declarations
                const reduceBudgets: IBudget[] = <IBudget[]>Array.prototype.reduce.apply(tags2Amounts, [sumTags, []]);
                return reduceBudgets.sort(sortByTags);
        }
    }

    /** ###  REDUCER FUNCTIONS  ###
     * These reducer methods are designed mostly for transaction collections that have already
     * been filtered in some fashion to where we want to start reporting on their data.
     * ############################
     */

    /**
     * Reducer method to get us the sum() of all the transactions in this collection.
     * @returns {Number}
     */
    public sum(): number {
        switch (this.length) {
            case 0:
                return 0;
            case 1:
                return this[0].amount;
            default:
                return this.reduce((total, txn) => total + txn.amount, 0);
        }
    }

    /**
     * Take advantage of the sum() method and return for us an average() of the transactions
     * in this collection.
     * @returns {Number}
     */
    public avg(): number {
        return this.length > 0? this.sum() / this.length: 0;
    }

    /**
     * Sorts the array based on datePosted.
     * @param asc TRUE for Ascending; FALSE for Descending.
     * @returns {Transactions} The sorted list of transactions by datePosted.
     */
    public sorted(asc=true): Transactions {
        return this.sort((a: ITransaction, b: ITransaction) => asc ? b.datePosted.getTime() - a.datePosted.getTime(): a.datePosted.getTime() - b.datePosted.getTime());
    }

    /**
     * Sorts by a specified key given that is a field of a transaction.
     * @param {keyof Transaction} key The key to sort by.
     * @param {boolean} asc TRUE for Ascending; FALSE for Descending.
     * @returns {Transactions} The sorted list of transactions by the specified key.
     */
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    public sortBy(key: TransactionFields, asc: boolean=true): Transactions {
        const result = <Transactions>this.concat();
        result.sort((a: ITransaction, b: ITransaction): number => {
            switch(true) {
                case ['datePending', 'datePosted'].includes(key):
                    return asc? (<Date>a[key]).getTime() - (<Date>b[key]).getTime(): (<Date>b[key]).getTime() - (<Date>a[key]).getTime();
                case ['amount'].includes(key):
                    return asc? (<number>a[key]) - (<number>b[key]): (<number>b[key]) - (<number>a[key]);
                case ['accountId', 'description', 'merchant'].includes(key):
                    return asc? ((<string>a[key]) > (<string>b[key])? -1: 1 ): ((<string>b[key]) > (<string>a[key])? -1: 1 );
                default:
                    return 0;
            }
        });
        return result;
    }

    /**
     * Take this list of transactions and group them by month.
     * with the key being the year and month and the value being a transaction collection
     * with subsequent matching year and month.
     * @returns {TransactionGroup} An Object mapping of {`YYYY-MM`: Transactions()}
     */
    public monthly(): TransactionGroup {
        switch( this.length ) {
            case 0:
                return new TransactionGroup();
            case 1:
                return new TransactionGroup(...this);
            default:
                return <TransactionGroup>this.sorted().reduce((monthGroups, txn: ITransaction) => monthGroups.append(txn as Transaction), new TransactionGroup());
        }
    }

    /**
     * Assumes all data points are found as they are required.
     * This method takes and combines the filter functions above to give us a robust method that will filter on
     * an "ANY" basis for the criteria described. In this way, we only iterate the transactions once and filter out
     * exactly what we need instead of iterating the transactions multiple times in a series of filters.
     * 
     * Unless otherwise specified, use `undefined` to disable any of the filters.
     * The DateRange filter requires both $fromDate and $toDate to be defined.
     * 
     * @param fromDate No transactions older than this date.
     * @param toDate No transactions newer than this date.
     * @param description Transactions matching this string.
     * @param limit Limit the number of transactions to this many.
     *  Use -1 to disable this filter.
     * @param tags List of tags transaction must match.
     * @param sort Sort the transactions by SortHeader.column.
     * @returns {Transactions} List of transactions after filtering and limiting.
     */
    public getTransactions(search: TransactionFilter): Transactions {
        let result = this.search((txn: ITransaction) => {
            const tests = {
                date: true,
                description: false,
                tags: false,
            };

            /* DATES */
            if ( search.fromDate && search.toDate ) {
                tests.date = this.filterDaterange(txn, search.fromDate, search.toDate);
            }

            /* DESCRIPTION */
            if ( search.description !== undefined ) {
                tests.description = this.filterDescription(txn, search.description);
            }

            /* TAGS (OR|ANY) */
            if ( search.tags && search.tags.length > 0 ) {
                tests.tags = this.filterTags(txn, search.tags);
            }

            const useDate = ( !!search.fromDate && !!search.toDate ),
                useDescription = !!search.description,
                useTags = !!search.tags && search.tags.length > 0;

                const truthy = [
                useDate? tests.date: true,
                useDescription? tests.description: true,
                useTags? tests.tags: true
            ];
            /*
            console.log([
                {useDate, fromDate, toDate },
                {useDescription, description},
                {useTags, tags},
                {truthy}
            ]); //*/

            return truthy.every(x => x);
        });

        if ( search.sort ) {
            result = result.sortBy(search.sort.column, search.sort.asc);
        }

        if ( search.limit && search.limit > 0 ) {
            result = <Transactions>result.slice(0, search.limit);
        }

        return result;
    }

    /**
     * Give me the institution mapping and list of transactions As CSV from bank.
     * I'll return back to you a data structure you can use to $upsert the database with transactions
     * mapped to the cannonical model.
     * @param {Institution} institution The mapped institution to this set of transactions.
     * @param {string} accountId The target accountId this CSV file has been dropped on.
     * @param {Transactions} transactions List of transactions/CSV rows as Object from CSV upload.
     * @returns {Transactions} List of transactions mapped to the canonical model.
     * @todo Reject bad data. Sure, we throw an Exception if the engineer does something wrong, but if the user
     *   drops the wrong CSV file on us, we need to filter out the txns that don't match what we expect to reduce
     *   the chances of cluttered data.
     * @todo Have the ability to accept or reject the changes as a result of dropping the CSV file on this account.
     *   Here is where we can implement some sort of "undo" function.
     */
    static digest(institution: IInstitution, accountId: TransactionFields, transactions: Transactions): Transactions {
        const results = new Transactions(), mappings: InstitutionMappings = <InstitutionMappings>institution.mappings.concat();
        transactions.map((transaction: ITransaction) => {
            const cannonical: Transaction = new Transaction();
            mappings.map((mapping: IMapping) => {
                switch(mapping.mapType) {
                    case MapTypes.csv:
                        Object.assign(cannonical, mapping.toField, mapping.fromField);
                        break;
                    case MapTypes.dynamic:
                        { // Braces here just to make TypeScript happy.
                            const value = (<PropertyDescriptor>Object.getOwnPropertyDescriptor(transaction, mapping.fromField)).value;
                            if ( mapping.toField == 'amount' ) {
                                if ( Object.hasOwn(cannonical, 'amount') ) {
                                    Object.assign(cannonical, 'amount', cannonical.amount + Number(value));
                                } else {
                                    Object.assign(cannonical, mapping.toField, value);
                                }
                                break;
                            }
                            Object.assign(cannonical, mapping.toField, value);
                        }
                        break;
                    default:
                        throw new Error(`Invalid mapType(${mapping.mapType}) for institution "${institution.name}" ` +
                        `attached to account "${accountId}" on transaction "${transaction.id}".`);
                }
            });
            results.add( cannonical );
        });
        return results.sorted();
    }

    /**
     * This is called twice in each of the account controllers to handle when a file upload is dropped.
     * Avoid copy-paste code.
     * @param {Yaba.models.Institutions} institutions Institutions Model Service.
     * @param {Yaba.models.accounts} accounts Accounts Model Service
     */
    // static csvHandler($rootScope, $scope, institutions: Yaba.models.Institutions, accounts: Yaba.models.accounts) {
    //     return (event, results) => {
    //         // Get all the transactions back and fill up the table.
    //         const transactions = Transactions.digest(
    //             institutions.byId(results.institutionId),
    //             results.accountId,
    //             results.parsedCSV.data
    //         );
    //         const account = accounts.byId(results.accountId);
    //         account.transactions.push(...transactions);
    //         accounts.save($scope);
    //         $rootScope.$broadcast('yaba.txn-change', {update: true});
    //     };
    // }

    /**
     * Linker function to join a transaction to the edit boxes we embed in a transaction listing.
     */
    // static txnTable($rootScope, $timeout) {
    //     return function($scope, $element, $attr, ngModel) {
    //         // Store the name of the element we will use later in distinguishing events.
    //         const fieldName = $attr.ngModel.replace('.', '-');
    //         const events = {};
    //         $scope.edit = {};
    //         const clickEvent = ($event) => {
    //             if ( !$element.hasClass('active-editing') ) {
    //                 const eventName = `yaba.edit2view-${fieldName}`;
    //                 /**
    //                  * For the onblur, onkeypress(Enter|Esc|Shift+Enter|Tab|Shift+Tab) events. This will let us
    //                  * leave editing context and return to view context.
    //                  * @param {Event} $$event JS Event object provided by AngularJS.
    //                  * @param {jQuery.element} input Input element that will hold the value we will extract.
    //                  * @param {Boolean} toSave TRUE if we should invoke the save event. FALSE if we are cancelling the edit.
    //                  */
    //                 events[eventName] = $scope.$on(eventName, ($$event, jqEvent, oldFieldValue=false) => {
    //                     if ( $element.hasClass('active-editing') ) {
    //                         $$event && $$event.preventDefault();
    //                         jqEvent && jqEvent.preventDefault();
    //                         $element.removeClass('active-editing');
    //                         if ( eventName in events ) {
    //                             events[eventName]();
    //                             delete events[eventName];
    //                         }

    //                         // If we are saving, then we are taking the value from the textbox as our input.
    //                         // If we are not saving, meaning we are cancelling the edit, then we revert to the
    //                         // ng-model="" value instead. We just use this method to ensure that it's decorated
    //                         // the same no matter how we return to "view-mode".
    //                         if ( oldFieldValue !== false ) {
    //                             ngModel.$$ngModelSet($scope, oldFieldValue);
    //                         }
    //                         $scope.edit[fieldName] = false;
    //                         $scope.$emit('save.accounts', this);
    //                         $rootScope.$broadcast('yaba.txn-change');
    //                         if ( jqEvent.type && ['keydown'].includes(jqEvent.type) ) {
    //                             try{ $scope.$apply(); } catch(e) { console.error(e); }
    //                         }
    //                     } else {
    //                         console.warn(`${eventName} called, but we are not actively-editing.`);
    //                     }
    //                 });

    //                 const attachEvents = () => {
    //                     const childInput = $($element).find('input');
    //                     // const childSpan = $($element.children()[0]); // Get the containing <span /> element.
    //                     // const childInput = $(childSpan.children()[0]); // Get the actual <input /> as jQuery element.
    //                     childInput.on('keydown', $$event => {
    //                         $$event.element = childInput;
    //                         $$event.keypress = true;
    //                         switch($$event.which) {
    //                             case 27: // [ESC]
    //                                 console.info(`fire keypress(key.Esc, ${eventName})`);
    //                                 $scope.$emit(eventName, $$event, fieldValue)
    //                                 return;
    //                             case 13: // [Enter]
    //                                 if ( !$$event.ctrlKey ) return;
    //                                 console.info(`fire keypress(key.Enter, ${eventName})`);
    //                                 $scope.$emit(eventName, $$event)
    //                                 return;
    //                         }
    //                     // }).on('blur', ($$event) => {
    //                     //     console.log(`fire blur(${eventName})`);
    //                     //     $scope.$emit(eventName, $$event);
    //                     }).focus();
    //                 };

    //                 const fieldValue = ngModel.$viewValue;
    //                 $event && $event.preventDefault();
    //                 $scope.edit[fieldName] = true;
    //                 $element.addClass('active-editing');

    //                 /**
    //                  * We have to call $timeout() here to ensure we've given the animations
    //                  * enough time to render the next components we are going to edit here.
    //                  */
    //                     $timeout(attachEvents, 10);

    //                 $scope.$apply();
    //             } else { // if ( !$element.hasClass('active-editing') )
    //                 console.warn('click() called but we already hasClass(active-editing)');
    //             }
    //         }; // clickEvent($event){}
    //         $scope.$parent.editable && $element.on('click', clickEvent);
    //     } // link($scope, $element, $attr, ngModel);
    // } // static txnTable();

    // static dataChart($scope, $element, $attr) {
    //     const budgets = () => {
    //         // Collect all the data points as [$date, $txnTags[0], $txnTags[1], ...];
    //         const dataPoints = (txn) => [ txn.datePosted ].concat($scope.txnTags.map(tag => txn.tags.includes(tag)? txn.amount: 0.0 ));
    //         // Iterate the full list of transactions to get the data points we need to plot.
    //         const dataMap = $scope.transactions.byTags($scope.txnTags).sorted().map(txn => dataPoints(txn));
    //         return [ ['Date'].concat($scope.txnTags) ].concat(dataMap);
    //     };
    //     $scope.$on('controls.change', () => $scope.rebalance());

    //     const redrawCharts = () => {
    //         const dataTable = new google.visualization.DataTable();
    //         const zeroTags = $scope.txnTags.map(x => 0.0);
    //         dataTable.addColumn({type: 'date', label: 'Date', pattern: 'yyyy-MM-dd'});
    //         $scope.txnTags.forEach(txnTag => dataTable.addColumn({ type: 'number', label: txnTag }));
    //         $scope.myBudgets = budgets(); // DEBUG
    //         if ( $scope.myBudgets.length <= 1 ) {
    //             console.warn('No budgets.');
    //             return;
    //         }
    //         // Insert a 0 metric for all tags to give them a starting point for the graph.
    //         $scope.myBudgets.splice(1, 0, [$scope.toDate].concat(zeroTags));
    //         // Append a 0 metric to the end as well to give the graphs something to render for the present.
    //         $scope.myBudgets.push([$scope.fromDate].concat(zeroTags));
    //         dataTable.addRows($scope.myBudgets.slice(1));
    //         const options = {
    //             title: 'Budget Spending',
    //             lineStyle: 'connected',
    //             legend: { position: 'bottom' }
    //         };
    //         const chart = new google.visualization.LineChart($element[0]);
    //         chart.draw(dataTable, options);
    //     };

    //     if ( Yaba.gCharts ) {
    //         // just do/listen
    //         return $scope.$watchCollection('transactions', redrawCharts);
    //     } else {
    //         // wait
    //         return $scope.$on('google-charts-ready', () => {
    //             console.info('Match google-charts-ready! Registering watcher...');
    //             return $scope.$watchCollection('transactions', redrawCharts);
    //         });
    //     }
    // }

} // class Transactions() {}

/**
 * When working on the Transactions() collection, it occurred to me that I was building a different
 * type of collection object. This is a wrapper around the Transactions() so they can be grouped by
 * date.
 * This is an extension of the Transactions class because it is a multiplex of transactions.
 * To be able to reference by index will get you a Transaction() as if it were part of a natural collection.
 * If you reference a key by a YYYY-MM format, you will access a Transactions() collection of ${this}
 * set of transactions that fall within that date range (ex. referencing "2022-11" will get you all
 * of NOV transactions in 2022.)
 * This only works for the YYYY-MM format which is great from the Prospect()ing page perspective.
 * In this case, it works because we are working with a multiplex of transactions that we want to
 * group by some factor, but still be able to reference transactions as a collection.
 */
class TransactionGroup {

    /**
     * Orgnize the set of transactions by month as they are allocated.
     */
    constructor(...args: ITransaction[]) {
        if ( args.length > 0 && typeof args[0] != 'number' ) {
            args.forEach((txns: ITransaction|ITransaction[], i: number) => {
                if ( false === txns instanceof Transactions && false === txns instanceof Transaction) {
                    throw new TypeError(`Argument ${i} must be Transaction() or Transactions(). Got ${txns.constructor.name}`);
                }
                if ( txns instanceof Transaction ) {
                    txns = new Transactions(txns);
                }
                this.append(...<Array<Transaction>>txns);
            });
        }
    }

    /**
     * Append another transaction to the list but categorize accordingly upon assignment.
     * @param  {...any} txns Transactions to attempt to append to this object.
     * @returns {TransactionGroup} This object for chaining.
     */
    append(...txns: Transaction[]|Transactions): TransactionGroup {
        txns.forEach((txn: ITransaction) => {
            const yyyymm: string = (<Transaction>txn).YYYYMM();
            if ( ! Object.hasOwn(this, yyyymm) ) {
                Object.defineProperty(this, yyyymm, { value: new Transactions(), enumerable: true });
            }
            (<PropertyDescriptor>Object.getOwnPropertyDescriptor(this, yyyymm)).value.push(txn);
        });
        return this;
    }

    /**
     * Get me a list of these transactions with 0 collections where there are no transactions.
     * e.g. `{2022-06: ..., 2022-08: ..., 2022-09: ...}`
     * will make: `{2022-06: ..., 2022-07: new Transactions(0), 2022-08: ..., 2022-09: ...}`
     * So we don't end up with skipping a month. Prepares us for Grid operations.
     * @param {Object{Date: Transactions }} txnGroups Result from `Transactions().monthly()`
     * @returns The input with each month filled in so there are no holes from start
     * date to end date. Please note that this is a self-mutating function. Use `this.slice()`
     * or `this.concat()` to get a copy first if you don't want to modify this in-place.
     */
    normalize() {
        for (
            let startDate = this.oldest(),
                endDate = this.newest();
            startDate < endDate;
            startDate.setUTCMonth(startDate.getUTCMonth() +1)
            ) {
            const shdt = startDate.toISOShortDate();
            if ( ! Object.hasOwn( this, shdt ) ) {
                console.log(`Missing ${startDate.toISOShortDate()}, adding a 0...`);
                const tx = new Transaction();
                tx.datePosted = startDate;
                tx.amount = 0.0;
                tx.description = 'TransactionGroup auto-record. Normalized 0-amount entry.';
                tx.merchant = this.constructor.name;
                tx.tags = ['hidden'];
                this.append(tx);
            }
        }
        return this;
    }

    /**
     * Give me another instance of myself and I will provide you a difference/subtraction
     * between the two as a new instance of myself.
     * @param {TransactionGroup} that The other transaction group to use for subtraction from ${this}.
     * @returns {TransactionGroup} New Group of Transactions that are summaries of the input groups.
     */
    subtract(that: TransactionGroup): TransactionGroup {
        const result = new TransactionGroup();
        // console.log('(this != that).oldest(): ', {income: this.oldest().toISOShortDate(), expense: that.oldest().toISOShortDate()});
        if ( this.oldest().toISOShortDate() != that.oldest().toISOShortDate() ) {
            if ( this.oldest() < that.oldest() ) {
                const tx = new Transaction();
                tx.datePosted = this.oldest();
                tx.amount = 0.0;
                tx.description = 'TransactionGroup auto-record. txnGroup.oldest() was newer than ${this}.';
                tx.merchant = this.constructor.name;
                tx.tags = ['hidden'];
                that.append(tx);
            }
            if ( that.oldest() < this.oldest() ) {
                const tx = new Transaction();
                tx.amount = 0.0;
                tx.description = 'TransactionGroup auto-record. txnGroup.oldest() was newer than ${this}.';
                tx.merchant = this.constructor.name;
                tx.tags = ['hidden'];
                this.append(tx);
            }
        }
        // console.log('(this != that).newest(): ', {income: this.newest().toISOShortDate(), expense: that.newest().toISOShortDate()});
        if ( this.newest().toISOShortDate() != that.newest().toISOShortDate() ) {
            if ( this.newest() < that.newest() ) {
                const tx = new Transaction();
                tx.amount = 0.0;
                tx.description = 'TransactionGroup auto-record. txnGroup.newest() was newer than ${this}.';
                tx.merchant = this.constructor.name;
                tx.tags = ['hidden'];
                that.append(tx);
            }
            if ( that.newest() < this.newest() ) {
                const tx = new Transaction();
                tx.amount = 0.0;
                tx.description = 'TransactionGroup auto-record. txnGroup.newest() was newer than ${this}.';
                tx.merchant = this.constructor.name;
                tx.tags = ['hidden'];
                this.append(tx);
            }
        }
        this.normalize();
        that.normalize();
        /*console.log('DEBUG: AFTER WORK: (this vs that).oldest(): ', {
            income: {
                oldest: this.oldest().toISOShortDate(),
                newest: this.newest().toISOShortDate()
            }, expense: {
                oldest: that.oldest().toISOShortDate(),
                newest: this.newest().toISOShortDate()
            }
        }); //*/
        for ( let incomes = this.items(), expenses = that.items();
            incomes.length > 0 && expenses.length > 0;
            null
        ) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const [ iDate, income ] = <[string, any]>incomes.shift(), [eDate, expense] = <[string, any]>expenses.shift();
            if ( iDate != eDate ) { console.warn("Dates don't match?!", iDate, eDate); }
            const amount = Math.abs(expense.sum()) - Math.abs(income.sum());
            const txn = new Transaction();
            Object.assign(txn, {
                datePosted: new Date(iDate + '-01'),
                amount,
                description: 'TransactionGroup auto-record. Placeholder summary of calculated transaction deltas.',
                merchant: that.constructor.name,
                tags: ['auto']
            });
            // console.log(txn); //@DEBUG
            result.append(txn);
        }
        return result;
    }

    public length(): number {
        return Object.keys(this).length;
    }

    /**
     * Pythonic way of getting dict.items(). Sorting by date instead of strings seems to be more reliable.
     * @returns {Array} The list of this set of items.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items(): [string, any][] {
        return Object.entries(this).concat().sort((a, b) => new Date(b[0] + '-01').getTime() - new Date(a[0] + '-01').getTime());
    }

    /**
     * Map over each of the collections of transactions we have.
     * @param {Function} callbackFn Callback Function to iterate over.
     * @returns Make [].map() available to `this`.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    map(callbackFn: Function) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const overrideCallbackFn = (value: [string, Transactions][], index: number, arr: [string, Transactions][]): any => {
            const [ date, txns ] = value;
            return callbackFn(date, txns, index, arr);
        }
        return this.items().map(overrideCallbackFn, this);
    }

    /**
     * Get the oldest transaction of this group collection.
     * @returns {Date} The date of the oldest transaction of this collection, `round()`ed.
     */
    oldest(): Date {
        try {
            // tslint:disable-next-line: no-unsafe-any
            return this.items().pop()?.pop().sorted().pop().datePosted.round();
        } catch (e) {
            console.error(`Failed getting oldest(): ${e}`);
            return NULLDATE;
        }
    }

    /**
     * Get the latest or most recent transaction of this group collection.
     * @returns {Date} The date of the newest/latest transaction of this collection, round()ed.
     */
    newest(): Date {
        try {
            return this.items().shift()?.pop().sorted().shift().datePosted.round();
        } catch (e) {
            console.error(`Failed getting newest(): ${e}`);
            return NULLDATE;
        }
    }

    /**
     * Give me a full sum of all the transactions in this collection of collections.
     * @returns {Number}
     */
    sum(): number {
        return this.sums().reduce((a, b) => a + Object.values(b).shift(), 0);
    }

    /**
     * Returns a list of sum() values from each of this collection of collections of transactions.
     * READ: Monthly summaries!
     * @returns {Array<Number>} List of numbers for the set of monthly summaries.
     */
    sums(): Array<number> {
        const objDescriptor = (txns: Transactions) => ({enumerable: true, writeable: true, value: txns.sum()});
        return this.map((date: string, txns: Transactions) => Object.defineProperty({}, date, objDescriptor(txns) ));
    }

    /**
     * Give me a full sum of all the transactions in this collection of collections.
     * @returns {Number}
     */
    average(): number {
        return this.averages().reduce((a, b) => a + Object.values(b).shift(), 0) / this.length();
    }

    /**
     * Provides a list of averages across all the transactions in this collection.
     * HINT: This is local averaging.
     */
    averages(): Array<number> {
        const objDescriptor = (txns: Transactions) => ({enumerable: true, writeable: true, value: txns.avg()});
        return this.map((date: string, txns: Transactions) => Object.defineProperty({}, date, objDescriptor(txns) ));
    }

    /**
     * This is where the magic happens. We PROJECT ourselves into the future and assume that our current
     * trajectory will remain the same for the forecasted future. As we iterate over the future,
     * we include the purchases we want to make in order to see how it will impact our paycheque.
     * Here, we count into the future until we want to see and include those transactions in our calculations.
     * Provide me with a matrix of what comes back.
     * @param {TransactionGroup} wishlist A list of transactions we want to make in the future.
     * @returns {TransactionGroup} New instance of this class for Projecting calculations/views.
     */
    project(wishlist: TransactionGroup|Transactions): TransactionGroup {
        if ( wishlist instanceof Transactions ) {
            wishlist = new TransactionGroup(...wishlist);
        }
        const result = new TransactionGroup();
        const avgBalance = this.average();
        const startDate = this.newest();
        const endDate = new Date(startDate.getTime() + TransactionDeltas.days365);
        console.log('wishlist', wishlist);
        console.log('start/end', startDate.toISOShortDate(), endDate.toISOShortDate());

        while ( startDate < endDate ) {
            const txn = new Transaction();
            txn.datePosted = startDate;
            txn.amount = avgBalance;
            txn.merchant = this.constructor.name;
            txn.tags = ['auto', 'future'];
            txn.description = 'TransactionGroup auto-record. Future wishlist item.';
            if ( Object.hasOwn(wishlist, txn.YYYYMM()) ) {
                const yymm = <Transaction[]>(<PropertyDescriptor>Object.getOwnPropertyDescriptor(wishlist, txn.YYYYMM())).value;
                result.append(...yymm);
            }
            result.append(txn);
            startDate.setUTCMonth(startDate.getUTCMonth() + 1)
        }
        return result;
    }
}

/**
 * This is a transaction list for all intent and purposes, but I need it stored under a different name.
 * An easy way to do this is to extend the class, but override nothing.
 */
export class Prospects extends Transactions {}
