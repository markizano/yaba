
import { v4 } from 'uuid';
import * as JSZip from 'jszip';
import { Papa, ParseError, ParseResult } from 'ngx-papaparse';

import { CURRENCY_RE, NULLDATE } from 'app/lib/constants';
import { TransactionDeltas, CurrencyType } from 'app/lib/structures';
import { IAccount, Account, Accounts } from 'app/lib/accounts';
import { InstitutionMappings, MapTypes, Institution } from 'app/lib/institutions';
import { Budgets, IBudget, Id2NameHashMap, Tags, TransactionFilter, TransactionType, YabaPlural } from 'app/lib/types';
import { Observable, forkJoin, mergeAll, of } from 'rxjs';

/**
 * Transaction interface to define a transaction.
 */
export interface ITransaction {
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

abstract class aTransaction implements ITransaction {
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
    id = v4();
    accountId = '';
    description = '';
    datePending = NULLDATE;
    datePosted = NULLDATE;
    transactionType = TransactionType.UNKNOWN;
    amount = 0.0;
    tax = 0.0;
    currency = CurrencyType.USD;
    merchant = '';
    tags = <Tags>[];

    /**
     * @factory Create a new Transaction instance from a string.
     */
    static fromString(loadString: string): Transaction {
        return Transaction.fromObject(JSON.parse(loadString));
    }

    /**
     * @factory Create a new Transaction instance from a given object.
     */
    static fromObject(data: ITransaction): Transaction {
        return new Transaction().update(data);
    }

    /**
     * Load a given data object into this object.
     * @param {ITransaction} data Data object to load.
     * @return {Transaction} Chainable object.
     */
    update(data: ITransaction): Transaction {
        data.id                 && (this.id = data.id);
        data.accountId          && (this.accountId = data.accountId);
        data.description        && (this.description = data.description);
        data.transactionType    && (this.transactionType = <TransactionType>data.transactionType);
        data.amount             && (this.amount = typeof data.amount == 'string' ? parseFloat(data.amount) : <number>data.amount);
        data.tax                && (this.tax = typeof data.tax == 'string'? parseFloat(data.tax): <number>data.tax);
        data.currency           && (this.currency = <CurrencyType>data.currency);
        data.merchant           && (this.merchant = data.merchant);
        data.tags               && (this.tags = typeof data.tags === 'string'? <Tags>(<string>data.tags).split('|'): <Tags>data.tags);
        if ( data.datePending && data.datePending != NULLDATE ) this.datePending = new Date(data.datePending);
        if ( data.datePosted  && data.datePosted  != NULLDATE ) this.datePosted  = new Date(data.datePosted);
        return this;
    }

    /**
     * Check to see if this transaction is of a given tag.
     * @param {string} tag Check to see if this transaction has a this given tag.
     * @returns {boolean} whether we have this tag or not.
     */
    hasTag(tag: string): boolean {
        return this.tags.includes(tag);
    }

    /**
     * Ensure a tag is set on this transaction.
     * @param {String} tag Name of the tag to ensure is set.
     * @returns {Transaction}
     */
    setTag(tag: string): Transaction {
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
    addTag(tag: string): Transaction {
        this.tags.push(tag);
        return this;
    }

    /**
     * Removes a tag from this transaction if it is set.
     * @param {String} tag The tag in question to ensure is removed.
     * @returns {Transaction}
     */
    removeTag(tag: string): Transaction {
        if ( this.hasTag(tag) ) {
            this.tags = this.tags.filter(t => t.toLowerCase() != tag.toLowerCase());
        }
        return this;
    }

    /**
     * Get the YYYYMM representation of this transaction for date categorization.
     * @returns {String}
     */
    YYYYMM(): string {
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
 * @param {Transaction[]} items Items to initialize the array with.
 * @returns {Transactions} Array of transactions.
 */
export class Transactions extends Array<Transaction> implements YabaPlural<Transaction> {

    /**
     * @property {Id2NameHashMap} id2name Abstract implementation to make the classes happy.
     */
    id2name: Id2NameHashMap = {};

    constructor(...items: ITransaction[]|Transaction[]|Transactions) {
        if ( items.length > 0 && typeof items[0] !== 'number' ) {
            for ( const i in items ) {
                const item = items[i];
                item instanceof Transaction || (items[i] = Transaction.fromObject(item));
            }
        }
        super(...items as Transaction[]);
    }

    /**
     * From a JSON stringified object load them into a new instance of this collection.
     * @param {String} loadString JSON string to load.
     * @returns {Transactions} New instance of Transactions.
     */
    static fromString(loadString: string): Transactions {
        return Transactions.fromList(JSON.parse(loadString));
    }

    /**
     * @factory Function to generate an account from a list of ITransaction[]s.
     */
    static fromList(list: Transaction[]): Transactions {
        return new Transactions().add(...list);
    }

    /**
     * Override of the push() function to ensure that each item added to the array is of type `Transaction`.
     * @param  {...Transaction} items 
     * @returns Number of items in the current set/array.
     */
    add(...items: ITransaction[]|Transaction[]|Transactions): Transactions {
        for ( const i in items ) {
            const item = items[i];
            items[i] instanceof Transaction || (items[i] = Transaction.fromObject(item));
            this.id2name[items[i].id] = items[i].description;
        }
        super.push(...items as Transaction[]);
        return this;
    }

    /**
     * Override the filter() method to ensure we return Transactions instead of Array<Transaction>.
     * @param {Function} predicate Callback function to filter the array.
     * @param {any} thisArg Context to use for the callback function.
     * @returns {Transactions} New array of Transactions.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    search(callback: Function, thisArg?: any): Transactions {
        const overrideCallback = (value: Transaction, index: number, txns: Transaction[]): boolean => {
            return callback(value, index, txns);
        };
        return <Transactions>this.filter(overrideCallback, thisArg);
    }

    /**
     * Override the map() method to ensure we return Transactions instead of Array<Transaction>.
     * @param {Function} callback Callback function to map the array.
     * @param {any} thisArg Context to use for the callback function.
     * @returns {Transactions} New array of Transactions.
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    it(callback: Function, thisArg?: any): Transactions {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const overrideCallback = (value: Transaction, index: number, txns: Transaction[]): any => {
            return callback(value, index, txns);
        };
        return <Transactions>this.map(overrideCallback, thisArg);
    }

    /**
     * Removes an item from this collection. Easier to understand than [].splice() since
     * we are using the ID field.
     * @param ID The ID field to remove.
     * @returns New Mutated array no longer containing the transaction.
     */
    remove(ID: string|Transaction): Transactions {
        const txId = ID instanceof Transaction? ID.id: ID;
        for ( const i in this ) {
            try {
                const item = this[parseInt(i)];
                if ( txId == item.id ) {
                    console.log('txns.remove(): ', item);
                    this.splice(parseInt(i), 1);
                    return this;
                }
            } catch ( e ) { console.error(e); }
        }
        console.log(`txns.remove(): ${txId} not found.`);
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
     * Check to see if this collection has a transaction by ID.
     */
    has(ID: string|Transaction): boolean {
        const txId = ID instanceof Transaction? ID.id: ID;
        return this.some(txn => txn.id == txId);
    }

    /**
     * For the account listing page, just return a sample of transactions as Transactions() not Transaction[].
     */
    sample(count?: number): Transactions {
        return <Transactions>this.slice(0, count ?? 5);
    }

    /**
     * Produce a CSV result of the contents of this object.
     * @returns {String} CSV string of the contents of this object.
     * @todo Figure out how to stream results rather than buffering in-memory.
     */
    toCSV(): string {
        if ( this.length == 0 ) {
            return '';
        }
        return this.reduce((txnZip: string[], transaction: Transaction) => {
            txnZip.push('"' + [
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
            ].join('","') + '"');
            return txnZip;
        }, ['"id","accountId","description","datePending","datePosted"' +
            ',"transactionType","amount","tax","currency","merchant","tags"']).join("\n");
    }

    /**
     * From a CSV file, import transactions into this collection.
     * @param {JSZip} jszip JSZip Instance
     */
    async fromZIP(accountId: string, jszip: JSZip): Promise<Transactions> {
        // this.clear(); // @TODO: restore this from the old version
        const papaOpts = { header: true, skipEmptyLines: true };
        const transactionCSV = await jszip.files[`transactions_${accountId}.csv`].async('text');
        const parsedTransactions = new Papa().parse(transactionCSV, papaOpts);
        this.add(...parsedTransactions.data.map((t: unknown) => Transaction.fromObject(t as ITransaction) ) );
        return this;
    }

    /**
     * Get the list of tags we have for this transaction collection.
     * @returns {Array<String>} List of *unique* tags associated with this collection of transactions.
     */
    getTags(): string[] {
        const tagCollection: string[] = this.map(txn => txn.tags).flat().sort();
        return Array.from<string>( new Set(tagCollection) );
    }

    /**
     * Add a tag to this set of transactions.
     * @param {string} tag The tag to add to this set of transactions.
     */
    addTag(tag: string): Transactions {
        return this.it((txn: Transaction) => txn.addTag(tag));
    }

    /**
     * In place mutation method to set a tag across all the selected transactions in this collection.
     * @param {String} tag The Tag to associate with all these transactions.
     * @returns {Transactions} Updated copy of transactions with this tag set on all of them.
     */
    setTag(tag: string): Transactions {
        return this.it((txn: Transaction) => txn.setTag(tag));
    }

    /**
     * Removes a tag from this transaction if it is set.
     * @returns {Transaction}
     */
    removeTag(tag: string): Transactions {
        return this.it((txn: Transaction) => txn.removeTag(tag));
    }

    /**
     * Get me a copy of transactions that have a tag, any tag set.
     * @returns {Transactions} new list of transactions that have a tag set.
     */
    haveTags(): Transactions {
        return this.search((t: Transaction) => t.tags.length > 0);
    }

    /**
     * Remove a tag from this set of transactions.
     * @param {string} tag The tag to remove from this set of transactions.
     */

    /**
     * Filter method for returning the date range specified.
     * @param {Transaction} txn The transaction for the filter iteration
     * @returns {Boolean} TRUE|FALSE based on if this txn is in the specified date range.
     */
    filterDaterange(txn: Transaction, fromDate: Date, toDate: Date): boolean {
        const recent = new Date(txn.datePosted).getTime() >= fromDate.getTime();
        const older = new Date(txn.datePosted).getTime() <= toDate.getTime();
        return recent && older;
    }

    /**
     * Filters out based on accountId even if what is provided is more than just a string.
     * @param {Transaction} txn Transaction by this.filter() function.
     * @param {string|Account} accountId Account ID to filter against.
     * @returns {boolean} TRUE|FALSE if we find this in the description.
     */
    filterAccountId(txn: Transaction, accountId: string|IAccount): boolean {
        return txn.accountId == (accountId instanceof Account? accountId.id: accountId);
    }

    /**
     * Filters out based on a list or collection of accountIds even if what is provided is more than just a string.
     * @param {Transaction} txn Transaction by this.filter() function.
     * @param {string|Account} accountIds Account ID to filter against.
     * @returns {boolean} TRUE|FALSE if we find this in the description.
     */
    filterAccountIds(txn: Transaction, accountIds: string[]|Accounts): boolean {
        return accountIds.includes(txn.accountId);
    }

    /**
     * Filter by description.
     * @param {Transaction} txn Transaction by this.filter() function.
     * @param {String|RegExp|undefined} description String description to filter against. Will match in .merchant or in .description.
     * @returns {Boolean} TRUE|FALSE if we find this in the description.
     */
    filterDescription(txn: Transaction, description: string|RegExp): boolean {
        // Assign as booleans to check if any in match.
        if ( typeof description == 'string' ) {
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
    filterTag(txn: Transaction, tag: string|undefined): boolean {
        return txn.tags.includes(tag || '');
    }

    /**
     * Check to see if the collection of tags is attached to this transaction. Match ANY.
     * @param {Transaction} txn Transaction as provided by this.filter();
     * @param {Array<String>|undefined} tags The tags to match against.
     * @returns TRUE|FALSE for `this.filter()` use on if this tag exists on this transaction or not.
     */
    filterTags(txn: Transaction, tags: string[]|undefined): boolean {
        return txn.tags.some((tag) => tags === undefined? true: tags.includes(tag || ''));
    }

    /**
     * Filters out transactions by date. Gives a Transaction collection
     * within a time range between two dates.
     * @param {Date} fromDate No transactions older than this date.
     * @param {Date} toDate No transactions newer than this date.
     * @returns {Transactions}
     */
    daterange(fromDate: Date, toDate: Date): Transactions {
        return this.search((txn: Transaction) => this.filterDaterange(txn, fromDate, toDate));
    }

    /**
     * Gimmie this transaction by ID.
     * Since the ID is unique, this will only ever return 1 element.
     * @param {String} ID The transaction.id we want to find.
     * @returns {Transaction} The transaction object by reference.
     */
    byId(ID: string): Transaction|undefined {
        return this.filter(txn => txn.id == ID).shift() || undefined;
    }

    /**
     * In the case that we have multiple accounts transactions in this collection,
     * this allows us to filter them out so we only have transactions of a specific
     * accountId.
     * @param {uuid.v4} accountId The account ID to filter.
     * @returns {Transactions} List of transactions only by accountId
     */
    byAccountId(accountId: string|Account): Transactions {
        return this.search((txn: Transaction) => this.filterAccountId(txn, accountId));
    }

    /**
     * In the case that we have multiple accounts transactions in this collection,
     * this allows us to filter them out so we only have transactions of a specific
     * accountId.
     * @param {uuid.v4} accountIds The account ID to filter.
     * @returns {Transactions} List of transactions only by accountId
     */
    byAccountIds(accountIds: string[]): Transactions {
        return this.search((txn: Transaction) => this.filterAccountIds(txn, accountIds));
    }

    /**
     * Gets a list of transactions that match the description.
     * @param {String|RegExp} description The description to match against.
     * @returns {Transactions} The list of matching transactions.
     */
    byDescription(description: string|RegExp): Transactions {
        return this.search((txn: Transaction) => this.filterDescription(txn, description));
    }

    /**
     * Filter the list of transactions by tag.
     * @param {String} tag Filter the list of transactions by tag.
     * @returns {Transactions} The list of matching transactions.
     */
    byTag(tag: string): Transactions {
        return this.search((txn: Transaction) => this.filterTag(txn, tag || ''));
    }

    /**
     * Filter the list of transactions by a collection of matching tags.
     * @param {Array} tags Filter the list of transactions by a set of tags.
     * @returns {Transactions} The list of matching transactions.
     */
    byTags(tags: string[]): Transactions {
        return this.search((txn: Transaction) => this.filterTags(txn, tags || []));
    }

    /**
     * Reduce this set of transactions down to get the list of budgets in alpha order with
     * transaction amounts associated with them.
     * @returns {Array<IBudget>} List of budgets to render in the widget.
     * For example, for each transaction that has a "Grocery" tag on it, it will be sum()d up
     * and result as a single {"Groceries": $amount} object in the resulting Array().
     */
    getBudgets(): Budgets {
        // Map each transaction to a {tag, amount} object.
        const tag2amount = (t: Transaction) => t.tags.map(tag => ({tag, amount: t.amount}) );
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
                return <Budgets>[];
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
    sum(): number {
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
    avg(): number {
        return this.length > 0? this.sum() / this.length: 0;
    }

    /**
     * Sorts the array based on  datePosted.
     * @param asc TRUE for Ascending; FALSE for Descending.
     * @returns {Transactions} The sorted list of transactions by datePosted.
     */
    sorted(asc=true): Transactions {
        return this.sort((a: Transaction, b: Transaction) => asc ? b.datePosted.getTime() - a.datePosted.getTime(): a.datePosted.getTime() - b.datePosted.getTime());
    }

    /**
     * Sorts by a specified key given that is a field of a transaction.
     * @param {keyof Transaction} key The key to sort by.
     * @param {boolean} asc TRUE for Ascending; FALSE for Descending.
     * @returns {Transactions} The sorted list of transactions by the specified key.
     */
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    sortBy(key: keyof Transaction, asc: boolean=true): Transactions {
        const result = <Transactions>this.concat();
        result.sort((a: Transaction, b: Transaction): number => {
            switch(true) {
                case ['datePending', 'datePosted'].includes(key):
                    return asc? new Date(<Date>a[key]).getTime() - new Date(<Date>b[key]).getTime(): new Date(<Date>b[key]).getTime() - new Date(<Date>a[key]).getTime();
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
    monthly(): TransactionGroup {
        switch( this.length ) {
            case 0:
                return new TransactionGroup();
            case 1:
                return new TransactionGroup(...this);
            default:
                return <TransactionGroup>this.sorted().reduce((monthGroups, txn: Transaction) => monthGroups.append(txn as Transaction), new TransactionGroup());
        }
    }

    /**
     * Like the TSA, search the transaction for what we are looking.
     * @param search 
     * @param txn 
     * @returns 
     */
    searchTransaction(search: TransactionFilter, txn: Transaction): boolean {
        const tests = {
            date: true,
            description: false,
            tags: false,
        };

        /* DATES */
        if ( search.fromDate !== undefined && search.toDate !== undefined && search.fromDate != NULLDATE && search.toDate != NULLDATE) {
            tests.date = this.filterDaterange(txn, new Date(search.fromDate), new Date(search.toDate));
        }

        /* DESCRIPTION */
        if ( search.description !== undefined && search.description !== '' ) {
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
            {useDate, fromDate: search.fromDate, toDate: search.toDate },
            {useDescription, description: search.description},
            {useTags, tags: search.tags},
            {truthy}
        ]); //*/

        return truthy.every(x => x);
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
    getTransactions(search: TransactionFilter): Transactions {
        let result = this.search((txn: Transaction) => this.searchTransaction(search, txn));

        if ( search.sort ) {
            result = result.sortBy(search.sort.column, search.sort.asc);
        }

        if ( search.page ) {
            const offset = search.page.pageIndex * search.page.pageSize,
              end = offset + search.page.pageSize;
            result = new Transactions(...result.slice(offset, end));
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static digest(institution: Institution, accountId: string, transactions: any): Transactions {
        const results = new Transactions(), mappings: InstitutionMappings = <InstitutionMappings>institution.mappings.concat();
        console.log('Transactions.digest()', accountId, transactions, mappings);
        for ( const transaction of transactions ) {
            const cannonical = new Transaction();
            // console.debug('new cannonical: ', cannonical, institution, transaction);
            for ( const mapping of mappings ) {
                const toField = mapping.toField as keyof ITransaction;
                switch(mapping.mapType) {
                    case MapTypes.value:
                        Object.assign(cannonical, toField, mapping.fromField);
                        // cannonical[toField] = mapping.fromField; // string is not assignable to type `never' ?? fuck you typescript...
                        // console.debug(cannonical);
                        break;
                    case MapTypes.dynamic:
                        try {
                            const value: string|number = transaction[mapping.fromField as keyof Transaction];
                            switch(mapping.toField) {
                                case 'id':
                                    cannonical.id = value.toString() ?? v4();
                                    break;
                                case 'description':
                                    cannonical.description = value.toString();
                                    break;
                                case 'datePending':
                                    cannonical.datePending = new Date(value);
                                    break;
                                case 'datePosted':
                                    cannonical.datePosted = new Date(value);
                                    break;
                                case 'transactionType':
                                    cannonical.transactionType = <TransactionType>value || TransactionType.UNKNOWN;
                                    break;
                                case 'amount':
                                    cannonical.amount = typeof value === 'number' ? value: parseFloat(value.toString().replaceAll(CURRENCY_RE, ''));
                                    break;
                                case 'tax':
                                    cannonical.tax = typeof value === 'number' ? value: parseFloat(value.toString().replaceAll(CURRENCY_RE, ''));
                                    break;
                                case 'currency':
                                    cannonical.currency = <CurrencyType>value || CurrencyType.USD;
                                    break;
                                case 'merchant':
                                    cannonical.merchant = value.toString();
                                    break;
                                case 'tags':
                                    cannonical.tags = <Tags>value.toString().split('|');
                                    break;
                            }
                            // console.log('Dynamic Mapping', cannonical, mapping.toField, value, transaction);
                            // Object.assign(cannonical, mapping.toField, value);
                        } catch(e) {
                            console.error('Failed to map dynamic field.', e);
                        }
                        break;
                    default:
                        throw new Error(`Invalid mapType(${mapping.mapType}) for institution "${institution.name}" ` +
                        `attached to account "${accountId}" on transaction "${transaction.id}".`);
                }
            }
            cannonical.accountId = accountId;
            const txn = Transaction.fromObject(cannonical);
            if ( txn.datePending == NULLDATE ) {
                txn.datePending = new Date(txn.datePosted.getTime() - 86400000);
            }
            // console.log('post-mapping cannonical: ', cannonical);
            results.add( txn );
        }
        return results.sorted();
    }

    /**
     * Handle the drop of a CSV file on an account table.
     */
    static csvHandler(files: File[]): Observable<Transactions> {
        console.log('Transactions.csvHandler()', files);
        if ( files.length == 0 ) {
            console.warn('No files to process.');
            return of( new Transactions() );
        } else {
            console.log('Processing files.');
            const csvFiles: Observable<Transactions>[] = [];
            files.forEach((csvFile) => {
                csvFiles.push(new Observable<Transactions>((parserSub) => {
                    const px = new Papa().parse(csvFile, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (parsedCSV: ParseResult): void => {
                            // Loosly typed data from CSV file. It will be filtered and matched up later.
                            console.log('observing CSV file.', csvFile, parsedCSV.data, parserSub);
                            parserSub.next(parsedCSV.data as Transactions);
                            parserSub.complete();
                        },
                        error: (error: ParseError, file?: File|undefined): void => {
                            console.error('Failed to parse CSV file.', file, error);
                            parserSub.error(error);
                        }
                    });
                    console.log('Request CSV parsing: ', csvFile, px);
                }));
            });
            return forkJoin(csvFiles).pipe(mergeAll());
        }
    }

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
    constructor(...args: Transaction[]|Transactions|ITransaction[]) {
        if ( args.length > 0 && typeof args[0] != 'number' ) {
            // coerce the type on each entity coming in.
            this.append(
                ...args.map((_txn: Transaction|ITransaction) => Transaction.fromObject(_txn))
            );
        }
    }

    /**
     * Append another transaction to the list but categorize accordingly upon assignment.
     * @param  {...any} txns Transactions to attempt to append to this object.
     * @returns {TransactionGroup} This object for chaining.
     */
    append(...txns: Transaction[]|Transactions): TransactionGroup {
        txns.forEach((txn: Transaction) => {
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

    length(): number {
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
