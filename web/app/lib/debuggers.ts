/* eslint @typescript-eslint/no-explicit-any: 0 */
import { v4 } from 'uuid';

import { TransactionType, Tags } from 'app/lib/types';
import { CurrencyType } from 'app/lib/structures';
import { Account, AccountTypes } from 'app/lib/accounts';
import { Transaction, Transactions } from 'app/lib/transactions';

import { Institution, InstitutionMapping, InstitutionMappings, MapTypes } from 'app/lib/institutions';

/**
 * RandomArray objectlet for generating random lists of constructor items.
 */
class RandomArray extends Array {

    constructor(...args: any[]) { super(...args); }

    random() {
        return this[Math.floor(Math.random() * this.length)];
    }
}

/**
 * SeedList objectlet for generating random lists of constructor items.
 */
export class SeedList {
    institutions = new RandomArray(
        {name: 'JPMC', description: 'JP Morgan Chase'},
        {name: 'BoA', description: 'Bank of America'},
        {name: 'WF', description: 'Wells Fargo'},
        {name: 'Synchrony', description: 'Synchrony Bank'},
        {name: 'CapOne', description: 'Capital One'},
        {name: 'Fidelity', description: 'Fidelity Checking'},
        {name: 'AmEx', description: 'American Express'},
    );
    merchants = new RandomArray(
        'Macys', 'Dillards', 'Banana Republic', 'Gap', 'Old Navy', 'JC Pennys',
        'Nordstrom', 'Nordstrom Rack',
        'Target', 'Walmart', 'Kroger', 'Tom Thumb', 'King Soopers', 'WinnCo Foods',
        'Dollar Tree', 'Dollar General', '99 cent store',
        'Ace Hardware', 'Toms Mechanics',
        'Toyota', 'Honda', 'Chevy', 'RAM', 'Loves', 'Race Track', 'Raceway',
        '7-Eleven', 'Valero', 'BP: Better Petroleum', 'Shell Gas', 'Robinhood'
    );
    products = new RandomArray(
        '2% Milk', 'Whole Milk', 'Half and Half', 'Heavy Whipping Cream',
        'Eggs', 'Cheese', 'Lunchmeat', 'Bread', 'Coffee', 'Ice Cream', 'Chips',
        'Pickles', 'Olives', 'Oil change', 'Brake Check', 'Tire Rotation', 'Fleece Shirt',
        'Barbie Doll', 'Ken Doll', `Action Figure #${SeedList.number(0, 10, 0)}`,
        'Sausage', 'Bacon', 'Ham', 'Onion', 'Celery', 'Jeans',
    );
    payments = new RandomArray(
        'Mortgage', 'Rent', 'Penalty', 'Credit Card Payment', 'Electric Bill', 'Groceries',
        'Gas', 'Water Bill', 'Internet', 'Cable', 'Tax Return Payments',
        'Auto Insurance', 'Home Insurance', 'Health Insurance',
    );
    investments = new RandomArray(
        'Dividends', 'S&P 500', 'QQQ', 'Crypto', 'Real Estate', 'REIT', 'ETF',
        'Bonds', 'T-Bills', 'Gold'
    );
    income = new RandomArray('Payroll', 'Income', 'Tips', 'Gifts', 'Sales', 'Dividends', 'Tax Returns');
    transactionTypes = new RandomArray('withdraw', 'deposit');
    headerTypes = {
        datePending: new RandomArray('Requested Date', 'Date Pending', 'Pending Date', 'Pending'),
        datePosted: new RandomArray('Transaction Date', 'Txn Date', 'Date Posted', 'Posted Date', 'Posted'),
        amount: new RandomArray('Amount', 'amount', 'Cost', 'Debit', 'Credit'),
        description: new RandomArray('Description', 'description', 'Memo', 'Remarks'),
        transactionType: new RandomArray('TxnType', 'Type', 'Transaction Type'),
    };
    accountTypes = new RandomArray(...Object.values(AccountTypes));

    static number(lower = 0, upper = 100, dec=2): number {
        // Gimmie a random number no greater than ${upper} as float() with ${dec} number of decimal places.
        const decimals = (value: string, index: number) => index? value.slice(0, dec): value;
        return Number((Math.random() * (upper - lower) + lower).toString().split('.').map<string>(decimals).join('.'));
    }

    genInstitution(): Institution {
        let name, description;
        ((i) => { name = i.name; description = i.description })(this.institutions.random());
        const mappings = new InstitutionMappings();
        mappings.add(InstitutionMapping.fromObject({
            fromField: this.headerTypes.datePending.random(),
            toField: 'datePending',
            mapType: MapTypes.dynamic
        }));
        mappings.add({
            fromField: this.headerTypes.datePosted.random(),
            toField: 'datePosted',
            mapType: MapTypes.dynamic
        });
        mappings.add({
            fromField: this.headerTypes.amount.random(),
            toField: 'amount',
            mapType: MapTypes.dynamic
        });
        mappings.add({
            fromField: this.headerTypes.description.random(),
            toField: 'description',
            mapType: MapTypes.dynamic
        });
        mappings.add({
            fromField: this.headerTypes.transactionType.random(),
            toField: 'transactionType',
            mapType: MapTypes.dynamic
        });
        mappings.add({
            fromField: 'USD',
            toField: 'currency',
            mapType: MapTypes.dynamic
        });
        return Institution.fromObject({name, description, mappings});
    }

    genAccount(institutionId: string): Account {
        let name, description;
        ((i) => { name = i.name; description = i.description })(this.institutions.random());
        return Account.fromObject({
            institutionId: institutionId,
            name: name,
            description: description,
            accountType: this.accountTypes.random(),
            transactions: new Transactions()
        });
    }

    genTransaction(accountId: string, o: any): Transaction {
        o.maxAmount = o.maxAmount || 100;
        o.minAmount = o.minAmount || 0;
        o.since = o.since || 31536000000; // 1 year by default.
        const ttype: TransactionType = o.ttype? o.ttype: this.transactionTypes.random(),
          institution = this.institutions.random(),
          amount = SeedList.number(o.minAmount, o.maxAmount, 2),
          datePosted = new Date(Date.now() - (Math.floor(Math.random() * o.since * 1000))),
          datePending = new Date(datePosted.getTime() - 259200000), // banks usually post in 3 business days.
          result = new Transaction();
        switch(ttype) {
            case TransactionType.Credit:
                switch(o.withdrawType) {
                    case 'sale': {
                        // in case of sale of item, like on credit card.
                        const merchant = this.merchants.random();
                        return Transaction.fromObject({
                            id: v4(),
                            description: `Purchased ${this.products.random()} from ${merchant}.`,
                            accountId: accountId,
                            datePending: datePending,
                            datePosted: datePosted,
                            transactionType: ttype,
                            amount: -amount,
                            tax: amount * 0.09,
                            currency: CurrencyType.USD,
                            merchant: merchant,
                            tags: new Tags(),
                        });
                    }
                    case 'payment': {
                        // In case we are making like a credit card payment.
                        // in case of sale of item, like on credit card.
                        const billCollector = this.institutions.random().description;
                        const bill = this.payments.random();
                        return Transaction.fromObject({
                            id: v4(),
                            description: `Paid on ${bill} from ${billCollector}.`,
                            accountId: accountId,
                            datePending: datePending,
                            datePosted: datePosted,
                            transactionType: ttype,
                            amount: -amount,
                            tax: 0.0,
                            currency: CurrencyType.USD,
                            merchant: billCollector,
                            tags: new Tags(),
                        });
                    }
                }
                break;
            case TransactionType.Debit: {
                const payroll = this.income.random();
                return Transaction.fromObject({
                    id: v4(),
                    description: `Income ${payroll} from ${institution.description}`,
                    accountId: accountId,
                    datePending: datePending,
                    datePosted: datePosted,
                    transactionType: ttype,
                    amount: amount,
                    tax: 0,
                    currency: CurrencyType.USD,
                    merchant: payroll,
                    tags: new Tags(),
                });
            }
            case TransactionType.Payment: {
                const merchant = this.merchants.random();
                return Transaction.fromObject({
                    id: v4(),
                    description: `Transfer to ${merchant}`,
                    accountId: accountId,
                    datePending: datePending,
                    datePosted: datePosted,
                    transactionType: ttype,
                    amount: -amount,
                    tax: 0,
                    currency: CurrencyType.USD,
                    merchant: merchant,
                    tags: new Tags(),
                });
            }
            case TransactionType.Transfer: {
                const investment = this.investments.random();
                return Transaction.fromObject({
                    id: v4(),
                    description: `Investment in ${investment}`,
                    accountId: accountId,
                    datePending: datePending,
                    datePosted: datePosted,
                    transactionType: ttype,
                    amount: -amount,
                    tax: 0,
                    currency: CurrencyType.USD,
                    merchant: investment,
                    tags: new Tags(),
                });
            }
        }
        return result;
    }
}
