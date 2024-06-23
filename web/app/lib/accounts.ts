import { v4 } from 'uuid';
import * as JSZip from 'jszip';
import * as Papa from 'papaparse';
import { ITransaction, TransactionFilter, Transactions } from 'app/lib/transactions';
import { Id2NameHashMap, YabaPlural } from 'app/lib/types';

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
 * @enum {String} InterestStrategy - Strategies for calculating interest.
 */
export enum InterestStrategy {
    Simple = 'simple',
    Compound = 'compound',
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
    update: (data: IAccount) => Account;
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

    constructor(id?: string,
      institutionId?: string,
      name?: string,
      description?: string,
      accountType?: AccountTypes,
      number?: string,
      routing?: string,
      interestRate?: number,
      interestStrategy?: InterestStrategy,
      transactions?: Transactions
      ) {
        this.id = id || v4();
        this.institutionId = institutionId || '';
        this.name = name || '';
        this.description = description || '';
        this.accountType = accountType || AccountTypes.UNKNOWN;
        this.number = number || '';
        this.routing = routing || '';
        this.interestRate = interestRate || 0.0;
        this.interestStrategy = interestStrategy || InterestStrategy.Simple;
        this.transactions = transactions || new Transactions();
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
            this.transactions.add(...data.transactions);
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
export class Accounts extends Array<Account> implements YabaPlural<IAccount> {

    /**
     * @property {Id2NameHashMap} id2name Convenience mapping of account.id to account.name for quick lookups.
     */
    id2name: Id2NameHashMap = {};

    constructor(...items: IAccount[]) {
        const id2name: Id2NameHashMap = {};
        if ( items.length > 0 && typeof items[0] !== 'number' ) {
            for ( const i in items ) {
                const item = new Account();
                if ( false === items[i] instanceof Account ) {
                    items[i] = item.update(items[i]);
                    id2name[item.id] = item.name;
                }
            }
        }
        super(...items);
        this.id2name = id2name;
    }

    /**
     * Override to Array.push().
     * @param  {...Account} items New Account(s) to add to this collection.
     * @returns {Number} Current number of items after adding.
     */
    add(...items: Account[]): number {
        for ( const i in items ) {
            const item = new Account();
            items[i] instanceof Account || (items[i] = item.update(items[i]));
            this.id2name[item.id] = item.name;
        }
        return super.push(...items);
    }

    /**
     * Removes an item from this collection. Easier to understand than [].splice() since
     * we are using the ID field.
     * @param {String} ID The ID field to remove.
     * @returns {Accounts} New Mutated array no longer containing the account.
     */
    remove(ID: Account|string): Accounts {
        const accountId = ID instanceof Account? ID.id: ID;
        for ( const i in this ) {
            try {
                if ( typeof i !== 'number' ) continue;
                const item = this[i];
                if ( item.id == accountId ) {
                    this.splice(i, 1);
                    break;
                }
            } catch (e) {
                console.error(`Error removing item ${i} from Accounts: ${e}`);
            }
        }
        delete this.id2name[accountId];
        return this;
    }

    /**
     * Remove all entries.
     * @return {void}
     */
    clear(): Accounts {
        this.length = 0;
        this.id2name = {};
        return this;
    }

    /**
     * Gimmie this account by ID.
     * Since the ID is unique, this will only ever return 1 element.
     * @param {String} ID The account.id we want to find.
     * @returns {Account} The Account object by reference removed from the list.
     */
    byId(ID: string): Account|undefined {
        return this.filter((acct: IAccount) => acct.id == ID).shift();
    }

    /**
     * Override includes method to consider class or account.id.
     * @param {String|Account} item Item to check against inclusion.
     * @returns {Boolean}
     */
    override includes(item: Account|string, fromIndex?: number|undefined): boolean {
        let itemId: string;
        if ( item instanceof Account ) {
            itemId = item.id;
        } else {
            itemId = item;
        }
        for ( const i in this ) {
            if ( typeof i !== 'number' ) continue; // eslint-disable-line no-continue
            if ( Number.isInteger(fromIndex) && i < Number(fromIndex) ) continue; // eslint-disable-line no-continue
            const acct = this[i];
            if ( acct instanceof Account && acct.id == itemId ) {
                return true;
            }
        }
        return false;
    }

    /**
     * Gets the unique set of tags from the transactions of this account.
     * @returns {Array<String>} The list of tags from the transactions in this list.
     */
    getTags(): string[] {
        const txnWithTags = this.map((acct: Account) => acct.transactions.getTags()).flat().sort();
        return Array.from(new Set( txnWithTags ));
    }

    /**
     * Get the list of transactions that match the filters.
     * @param selectedAccounts List of accounts to search. If not provided, all accounts are searched.
     * @param fromDate The earliest date to search for. If not provided, all transactions are searched and returned regardless of source date.
     * @param toDate The latest date to search for. If not provided, all transactions are searched and returned regardless of target date.
     * @param description The description to search for. If not provided, all transactions are searched regardless of description contents.
     * @param tags The list of tags to search for. If not provided, all transactions are searched regardless of tags.
     * @param limit The maximum number of transactions to return. If not provided, all transactions are returned.
     * @returns New list of transactions that match the search criteria.
     */
    public getTransactions(search: TransactionFilter): Transactions {
        return this.selected(search.accounts).reduce((a: Transactions, b: IAccount) => {a.add(...b.transactions.getTransactions(search)); return a;}, new Transactions());
    }

    /**
     * Produce a CSV result of the contents of this object.
     * @returns {JSZip} The JSZip object with the CSV files.
     * @todo Figure out how to stream results rather than buffering in-memory.
     */
    public toCSV(jszip: JSZip): JSZip {
        if ( this.length == 0 ) {
            return jszip;
        }
        const accountsZIP = ['"id","institutionId","name","description"' +
            ',"accountType","number","routing","interestRate","interestStrategy"'];
        this.forEach((account: Account) => {
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
    public async fromZIP(jszip: JSZip): Promise<Accounts> {
        this.length = 0;
        const papaOpts = { header: true, skipEmptyLines: true };
        const accountsCSV = await jszip.files['accounts.csv'].async('text');
        const parsedAccounts: Papa.ParseResult<IAccount> = Papa.parse(accountsCSV, papaOpts);
        this.add(...parsedAccounts.data);
        for ( const account of this ) {
            await account.transactions.fromZIP(account.id, jszip);
            console.info(`> Parsed out ${account.transactions.length} transactions for account "${account.name}".`);
        }
        console.info(`Parsed ${this.length} Accounts from CSV file for ${this.map((a: Account) => a.transactions.length).reduce((a: number, b: number) => a += b, 0)} transactions.`);
        return this;
    }

    /**
     * Execute on the filtering of accounts based on what was selected.
     * @param {String|Account|Array<String>|Array<Account>|Accounts} selectedAccounts The selected accounts to filter against.
     * @returns The accounts that match what was listed in the provided item or collection.
     */
    public filterSelected(account: Account|string, selectedAccounts: Accounts | Account[] | Account | undefined) {
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
    public selected(selectedAccounts: Accounts | Account[] | undefined): Accounts {
        return <Accounts>this.filter((a: Account) => this.filterSelected(a, selectedAccounts));
    }

    /**
     * Load accounts from a given JSON stringified object.
     * @param {string} loadString The JSON string to parse and load into this object.
     * @returns {Accounts}
     */
    static fromString(loadString: string): Accounts {
        return new Accounts(...JSON.parse(loadString));
    }
}
