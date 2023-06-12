import { v4 } from 'uuid';
import { Institution } from './institutions';
import { ITransaction, Transactions } from './transactions';

/**
 * @enum {String} AccountTypes - Types of accounts for tracking.
 */
export enum AccountTypes {
    UNKNOWN = 'unknown',
    Checking = 'checking',
    Savings = 'savings',
    Credit = 'credit',
    Loan = 'loan',
    /* To be supported...
    Broker = 'broker',
    IRA = 'ira',
    k401: '401k',
    b403: '403b',
    SEP: 'sep',
    Crypto: 'crypto',
    //*/
}

/**
 * @interface IAccount - Data model object to represent an account.
 */
export interface IAccount {
    id: string;
    institutionId: string;
    name: string;
    description: string;
    balance: () => number;
    accountType: AccountTypes;
    number: string;
    routing: string;
    interestRate: number;
    interestStrategy: InterestStrategy;
    transactions: Transactions;
}

/**
 * @enum {String} InterestStrategy - Strategies for calculating interest.
 */
export enum InterestStrategy {
    Simple = 'simple',
    Compound = 'compound',
}

/**
 * Data model object to represent an account.
 * Coerces a Hash/Object into something we can use as institution to at least typecast the
 * structure as we need it here.
 */
export class Account implements IAccount {

    public id: string;
    public institutionId: string;
    public name: string;
    public description: string;
    public accountType: AccountTypes;
    public number: string;
    public routing: string;
    public interestRate: number;
    public interestStrategy: InterestStrategy;
    public transactions: Transactions;

    constructor(id = '',
      institutionId = '',
      name = '',
      description = '',
      accountType: AccountTypes = AccountTypes.UNKNOWN,
      number = '',
      routing = '',
      interestRate = 0.0,
      interestStrategy: InterestStrategy = InterestStrategy.Simple,
      transactions: Transactions = new Transactions()
      ) {
        this.id = id || v4();
        this.institutionId = institutionId || '';
        this.name = name || '';
        this.description = description || '';
        this.accountType = accountType || null;
        this.number = number || '';
        this.routing = routing || '';
        this.interestRate = interestRate || 0.0;
        this.interestStrategy = interestStrategy || null;
        this.transactions = transactions;
    }

    /**
     * Updates this object with any data one might have for updates.
     * @param {Object} data Input data to update for this object.
     */
    public update(data: IAccount): Account {
        data.id                 && (this.id = data.id);
        data.institutionId      && (this.institutionId = data.institutionId);
        data.name               && (this.name = data.name);
        data.description        && (this.description = data.description);
        data.accountType        && (this.accountType = data.accountType);
        data.number             && (this.number = data.number);
        data.routing            && (this.routing = data.routing);
        data.interestRate       && (this.interestRate = Number(data.interestRate));
        data.interestStrategy   && (this.interestStrategy = data.interestStrategy);
        if (  Object.hasOwn(data, 'transactions') && data.transactions instanceof Array ) {
            this.transactions.push(...data.transactions);
        }
        return this;
    }

    /**
     * Balance as a function will allow us to traverse the current transaction list.
     * @returns {Number} The current running balance of this account.
     */
    public balance(): number {
        return this.transactions.reduce((result: number, txn: ITransaction) => result += txn.amount, 0.0);
    }
}

/**
 * Representation of an Account collection that you can render as JSON when converted to string.
 * Allows for operations on a per-account basis.
 * Also allows for defining handy functions that we'd use as filters.
 */
export class Accounts {
    constructor(...items: string[][]) {
        if ( items.length > 0 && typeof items[0] !== 'number' ) {
            for ( const i in items ) {
                const item = items[i];
                if ( false === item instanceof Account ) {
                    items[i] = new Account(item);
                }
            }
        }
        super(...items);
    }

    /**
     * Override to Array.push().
     * @param  {...Account} items New Account(s) to add to this collection.
     * @returns {Number} Current number of items after adding.
     */
    push(...items: unknown[]) {
        for ( const i in items ) {
            const item = items[i];
            item instanceof Account || (items[i] = new Account(item));
        }
        return super.push(...items);
    }

    /**
     * Override to Array.unshift().
     * @param  {...Account} items New Account(s) to add to this collection.
     * @returns {Number} Current number of items after adding.
     */
    unshift(...items: any[]) {
        for (const i in items) {
            const item = items[i];
            item instanceof Account || (items[i] = new Account(item));
        }
        return super.unshift(...items);
    }

    /**
     * Removes an item from this collection. Easier to understand than [].splice() since
     * we are using the ID field.
     * @param {String} ID The ID field to remove.
     * @returns {Accounts} New Mutated array no longer containing the account.
     */
    remove(ID: any) {
        for ( let i=0; i < this.length; i++ ) {
            const item = this[i];
            if (item.id == ID) {
                this.splice(i, 1);
            }
        }
        return this;
    }

    /**
     * Gimmie this account by ID.
     * Since the ID is unique, this will only ever return 1 element.
     * @param {String} ID The account.id we want to find.
     * @returns {Account} The Account object by reference.
     */
    byId(ID: any) {
        return this.filter((acct: { id: any; }) => acct.id == ID).shift();
    }

    /**
     * Override includes method to consider class or account.id.
     * @param {String|Account} item Item to check against inclusion.
     * @returns {Boolean}
     */
    includes(item: string) {
        let itemId: string;
        if ( item instanceof Account ) {
            itemId = item.id;
        } else {
            itemId = item;
        }
        return !!this.filter((x: { id: any; }) => x instanceof Account? x.id: x == itemId).length;
    }

    /**
     * Gets the unique set of tags from the transactions of this account.
     * @returns {Array<String>} The list of tags from the transactions in this list.
     */
    getTags() {
        return Array.from(new Set( this.map((a: { transactions: { getTags: () => any; }; }) => a.transactions.getTags()).flat().sort() ));
    }

    /**
     * Get the list of transactions that match the filters.
     * @returns {Transactions} New list of transactions that match the search criteria.
     */
    getTransactions(selectedAccounts: any, fromDate: any, toDate: any, description=undefined, tags=undefined, limit=-1) {
        const result = new Transactions();
        const searchResults = this.selected(selectedAccounts).map(
            (            a: { transactions: { getTransactions: (arg0: any, arg1: any, arg2: undefined, arg3: undefined) => any; }; }) => a.transactions.getTransactions(
                fromDate,
                toDate,
                description,
                tags
            )
        ).flat(); // Returns Accounts(x)[...Transactions]
        if ( searchResults.length ) {
            result.push( ...Transactions.prototype.sorted.call(searchResults) );
        }
        return limit && limit > 0? result.slice(0, limit): result;
    }

    /**
     * Produce a CSV result of the contents of this object.
     * @returns {String}
     */
    toCSV(jszip: { file: (arg0: string, arg1: string) => void; }) {
        if ( this.length == 0 ) {
            return jszip;
        }
        const accountsZIP = ['"id","institutionId","name","description"' +
            ',"accountType","number","routing","interestRate","interestStrategy"'];
        this.forEach((account: { id: any; institutionId: any; name: any; description: any; accountType: any; number: any; routing: any; interestRate: any; interestStrategy: any; transactions: { toCSV: () => any; }; }) => {
            const aFields = [
                account.id,
                account.institutionId,
                account.name,
                account.description,
                account.accountType,
                account.number,
                account.routing,
                account.interestRate,
                account.interestStrategy
            ];
            accountsZIP.push(`"${aFields.join('","')}"`);
            jszip.file(`transactions_${account.id}.csv`, account.transactions.toCSV());
        });
        jszip.file('accounts.csv', accountsZIP.join("\n"));
        return jszip;
    }

    /**
     * Read a ZIP file and populate this instance with the data from the CSV.
     * @param {JSZip} jszip Instance of JSZip containing the files we need to operate on this instance.
     */
    async fromZIP(jszip: { files: { [x: string]: { async: (arg0: string) => any; }; }; }) {
        this.length = 0;
        const papaOpts = { header: true, skipEmptyLines: true };
        const accountsCSV = await jszip.files['accounts.csv'].async('text');
        const parsedAccounts = Papa.parse(accountsCSV, papaOpts);
        this.push(...parsedAccounts.data);
        for ( const account of this ) {
            await account.transactions.fromZIP(account.id, jszip);
            console.info(`> Parsed out ${account.transactions.length} transactions for account "${account.name}".`);
        }
        console.info(`Parsed ${this.length} Accounts from CSV file for ${this.map((a: { transactions: string | any[]; }) => a.transactions.length).reduce((a: any,b: any) => a += b, 0)} transactions.`);
    }

    /**
     * Execute on the filtering of accounts based on what was selected.
     * @param {String|Account|Array<String>|Array<Account>|Accounts} selectedAccounts The selected accounts to filter against.
     * @returns The accounts that match what was listed in the provided item or collection.
     */
    filterSelected(account: { id: any; }, selectedAccounts: { some: (arg0: (selectedAccount: any) => boolean) => any; id: any; } | undefined) {
        if ( selectedAccounts === undefined ) {
            return true;
        }
        const accountId = account instanceof Account? account.id: account;
        if ( selectedAccounts instanceof Array ) {
            return selectedAccounts.some(selectedAccount =>
                (account instanceof Account? account.id: account) == (selectedAccount instanceof Account? selectedAccount.id: selectedAccount)
            );
        } else {
            if ( selectedAccounts instanceof Account ) {
                return selectedAccounts.id == accountId;
            } else {
                return selectedAccounts == accountId;
            }
        }
    }

    /**
     * Get the list of selected accounts from the input provided.
     * @param {Array|Accounts} selectedAccounts The list of accounts to check for includes. Match ANY accounts listed.
     * @returns {Accounts}
     */
    selected(selectedAccounts: any) {
        return this.filter((a: any) => this.filterSelected(a, selectedAccounts));
    }

}

