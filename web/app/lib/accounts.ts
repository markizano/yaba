import { v4 } from 'uuid';
import * as JSZip from 'jszip';
import * as Papa from 'papaparse';
import { ITransaction, Transactions } from 'app/lib/transactions';
import { Id2NameHashMap, NgSelectable, TransactionFilter, YabaPlural } from 'app/lib/types';
import { Institution } from './institutions';

/**
 * @enum {String} AccountTypes - Types of accounts for tracking.
 */
export enum AccountTypes {
    UNKNOWN = 'unknown',
    Checking = 'checking',
    Savings = 'savings',
    Credit = 'credit',
    Loan = 'loan',
    /* @TODO: To be supported...
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
    name: string;
    description: string;
    institutionId: string;
    accountType: AccountTypes;
    transactions: Transactions;
}

abstract class oAccount implements IAccount {
    abstract id: string;
    abstract institutionId: string;
    abstract name: string;
    abstract description: string;
    abstract accountType: AccountTypes;
    abstract transactions: Transactions;
    abstract balance(): number;
    abstract update(data: IAccount): Account;
}

/**
 * Data model object to represent an account.
 * Coerces a Hash/Object into something we can use as institution to at least typecast the
 * structure as we need it here.
 */
export class Account extends oAccount implements IAccount {
    id = v4();
    institutionId = '';
    name = '';
    description = '';
    accountType = AccountTypes.UNKNOWN;
    transactions = new Transactions();

    /**
     * @factory Parse a string into an instance of this object.
     */
    static fromString(loadString: string): Account {
        return Account.fromObject(JSON.parse(loadString));
    }

    /**
     * @factory Parse a JSON object into an instance of this object.
     */
    static fromObject(obj: IAccount): Account {
        return new Account().update(obj);
    }

    /**
     * Gimmie a list of account types I can use in the drop-down for what kind of account type to choose.
     */
    static Types(): NgSelectable<AccountTypes>[] {
        return Object.keys(AccountTypes).filter((x) => typeof x === 'string').map((y) => ({ label: y, value: AccountTypes[y as keyof typeof AccountTypes] }));
    }

    /**
     * Updates this object with any data one might have for updates.
     * @param {Object} data Input data to update for this object.
     */
    update(data: IAccount): Account {
        if ( 'id' in data && data.id ) {
            this.id = <string>data.id ?? v4();
        }
        this.institutionId = data.institutionId ?? '';
        this.name = data.name ?? '';
        this.description = data.description ?? '';
        this.accountType = data.accountType ?? AccountTypes.UNKNOWN;
        if ( 'transactions' in data && data.transactions instanceof Array ) {
            this.transactions.add(...data.transactions);
        }
        return this;
    }

    /**
     * Balance as a function will allow us to traverse the current transaction list.
     * @returns {Number} The current running balance of this account.
     */
    balance(): number {
        return this.transactions.reduce((result: number, txn: ITransaction) => result += txn.amount, 0.0);
    }
}

/**
 * Representation of an Account collection that you can render as JSON when converted to string.
 * Allows for operations on a per-account basis.
 * Also allows for defining handy functions that we'd use as filters.
 */
export class Accounts extends Array<Account> implements YabaPlural<Account> {

    /**
     * @property {Id2NameHashMap} id2name Convenience mapping of account.id to account.name for quick lookups.
     */
    id2name: Id2NameHashMap = {};

    constructor(...items: IAccount[]|Account[]|Accounts) {
        const id2name: Id2NameHashMap = {};
        if ( items.length > 0 && typeof items[0] !== 'number' ) {
            for ( const i in items ) {
                const item = items[i];
                items[i] instanceof Account || (items[i] = Account.fromObject(item));
                id2name[(<Account>items[i]).id] = item.name;
            }
        }
        super(...items as Account[]);
        this.id2name = id2name;
    }

    /**
     * Load accounts from a given JSON stringified object.
     * @param {string} loadString The JSON string to parse and load into this object.
     * @returns {Accounts}
     */
    static fromString(loadString: string): Accounts {
        try {
            return Accounts.fromList(JSON.parse(loadString));
        } catch (e) {
            console.error(`Error parsing JSON string: ${e}`);
            return new Accounts();
        }
    }

    /**
     * @factory Function to generate an account from a list of IAccount[]s.
     */
    static fromList(list: IAccount[]|Accounts): Accounts {
        const result = new Accounts();
        if ( list instanceof Accounts || list instanceof Array ) {
            result.add(...list);
        }
        return result;
    }

    /**
     * @factory Function to generate a list of transactions from a CSV dump.
     */
    static parseCSVFiles(account: Account, csvFiles: File[], institution: Institution, errors: string[]): Promise<Transactions> {
        console.log('Parsing CSV files: ', account, csvFiles);
        return new Promise((resolve, reject) => {
            const toAddTxns = new Transactions();
            const error = (e: unknown) => {
                console.error('Error digesting transactions: ', e);
                errors.push(<string>e);
                reject(e);
            }
            const next = (transactions: Transactions) => {
                console.log('CSV Parsed transactions: ', transactions);
                try {
                    const txns = Transactions.digest(institution, account.id, transactions);
                    console.log('Digested transactions: ', txns);
                    toAddTxns.add(...txns);
                } catch (e) {
                    error(e);
                }
            };
            const complete = () => {
                console.log('CSV parse complete.', toAddTxns);
                resolve(toAddTxns);
            };
            Transactions.csvHandler(csvFiles).subscribe({next, complete, error});
        });
    }

    /**
     * Override to Array.push().
     * @param  {...Account} items New Account(s) to add to this collection.
     * @returns {Number} Current number of items after adding.
     */
    add(...items: IAccount[]|Account[]|Accounts): Accounts {
        for ( const i in items ) {
            const item = items[i];
            items[i] instanceof Account || (items[i] = Account.fromObject(item));
            this.id2name[(<Account>items[i]).id] = item.name;
        }
        super.push(...items as Account[]);
        return this;
    }

    /**
     * Removes an item from this collection. Easier to understand than [].splice() since
     * we are using the ID field.
     * @param {String} ID The ID field to remove.
     * @returns {Accounts} New Mutated array no longer containing the account.
     */
    remove(ID: Account|string): Accounts {
        const accountId = ID instanceof Account? ID.id: ID;
        if ( this.length == 0 ) {
            console.log('No items to remove from Accounts.');
            return this;
        }
        for ( let i = 0, item = this[i]; i < this.length; i++, item = this[i] ) {
            try {
                if ( item.id == accountId ) {
                    console.log(`Removing item ${i} from Accounts: `, item);
                    this.splice(i, 1);
                    break;
                }
                delete this.id2name[accountId];
                return this;
            } catch (e) {
                console.error(`Error removing item ${i} from Accounts: ${e}`);
            }
        }
        console.log(`Account ${accountId} not found in Accounts.`);
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
     * Check to see if this collection has a transaction by ID.
     */
    has(ID: string|Account): boolean {
        const accountId = ID instanceof Account? ID.id: ID;
        return this.some((acct: Account) => acct.id == accountId);
    }

    /**
     * Gimmie this account by ID.
     * Since the ID is unique, this will only ever return 1 element.
     * @param {String} ID The account.id we want to find.
     * @returns {Account} The Account object by reference removed from the list.
     */
    byId(ID: string): Account|undefined {
        return this.filter((acct: Account) => acct.id == ID).shift();
    }

    /**
     * Override includes method to consider class or account.id.
     * @param {String|Account} item Item to check against inclusion.
     * @returns {Boolean}
     */
    override includes(item: Account|string, fromIndex?: number|undefined): boolean {
        const itemId = item instanceof Account? item.id: item;
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
    getTransactions(search: TransactionFilter): Transactions {
        return this.selected(search.accounts).reduce((a: Transactions, b: IAccount) => {a.add(...b.transactions.getTransactions(search)); return a;}, new Transactions());
    }

    /**
     * Produce a CSV result of the contents of this object.
     * @returns {JSZip} The JSZip object with the CSV files.
     * @todo Figure out how to stream results rather than buffering in-memory.
     */
    toCSV(jszip: JSZip): JSZip {
        if ( this.length == 0 ) {
            return jszip;
        }
        const accountsZIP = ['"id","institutionId","name","description"' +
            ',"accountType"'];
        this.forEach((account: Account) => {
            const aFields = [
                account.id,
                account.institutionId,
                account.name,
                account.description,
                account.accountType,
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
    async fromZIP(jszip: JSZip): Promise<Accounts> {
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
    filterSelected(account: Account|string, selectedAccounts: Accounts | Account[] | Account | undefined) {
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
    selected(selectedAccounts: Accounts | Account[] | undefined): Accounts {
        return <Accounts>this.filter((a: Account) => this.filterSelected(a, selectedAccounts));
    }
}
