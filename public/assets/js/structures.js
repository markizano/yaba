/**
 * Models around Yaba controllers. Tie HTTP calls and data together.
 */
(function(Yaba) {
    'use strict';

    /**
     * Object we can use for NULL but also instanceof Date().
     */
    const NULLDATE = new Date('1970-01-01T00:00:');

    /**
     * enum(PayCycle). Set of key-value pairs of pay cycles.
     */
    const PayCycle = Object.freeze({
        Weekly: 'weekly',
        BiWeekly: 'bi-weekly',
        BiMonthly: 'bi-monthly',
        Monthly: 'monthly',
        Quarterly: 'quarterly',
        Annually: 'annually',
    });

    class JSONable {
        constructor(keys) {
            this._keys = Object.freeze(keys);
        }

        /**
         * I hardcode the keys here to at least return the top-level members we want to see in the string results.
         * If this class gets inherited, the child class may capture $(this) including additional methods and possibly
         * properties of the child class we may not want to capture all those extra data points.
         * Limited to the top-level members of this class we want in the JSON/string result.
         * @returns {string}
         */
        toString() {
            return JSON.stringify( this.toObject() );
        }

        /**
         * Return the hardcoded keys of this class.
         * @returns (Object) Object version of this Class Object.
         */
        toObject() {
            var result = {};
            this._keys.forEach((key) => {
                var value = this[key];
                if (this[key] instanceof Date) {
                    value = this[key].toISOShortDate();
                }
                result[key] = value;
            });
            return result;
        }
    }

    /**
     * Data model object to represent an institution.
     * Coerces a Hash/Object into something we can use as institution to at least typecast the
     * structure as we need it here.
     */
    class Institution extends JSONable {
        constructor(data={}) {
            super(['id', 'name', 'description', 'mappings']);
            this.id = data.id || '';
            this.name = data.name || '';
            this.description = data.description || '';
            this.mappings = [];
            data.hasOwnProperty('mappings') && (data.mappings.forEach((mapping) => {
                this.mappings.push({
                    fromField: mapping.fromField || '',
                    toField: mapping.toField || '',
                    mapType: mapping.mapType || null
                });
            }));
        }
    }

    /**
     * Data model object to represent an account.
     * Coerces a Hash/Object into something we can use as institution to at least typecast the
     * structure as we need it here.
     */
    class Account extends JSONable {
        static Types = {
            Checking: 'checking',
            Savings: 'savings',
            Credit: 'credit',
            Loan: 'loan',
            /* To be supported...
            Broker: 'broker',
            IRA: 'ira',
            k401: '401k',
            b403: '403b',
            SEP: 'sep',
            Crypto: 'crypto',
            //*/
        };

        constructor(data={}) {
            super(['id', 'institutionId', 'name', 'description', 'balance', 'accountType', 'number', 'routing',
              'interestRate', 'interestStrategy', 'transactions']);
            this.id = data.id || '';
            this.institutionId = data.institutionId || '';
            this.name = data.name || '';
            this.description = data.description || '';
            this.balance = data.balance || 0.0;
            this.accountType = data.accountType || null;
            this.number = data.number || '';
            this.routing = data.routing || '';
            this.interestRate = data.interestRate || 0.0;
            this.interestStrategy = data.interestStrategy || null;
            this.transactions = [];
            data.hasOwnProperty('transactions') && (data.transactions.forEach((transaction) => {
                this.transactions.push(new Transaction(transaction));
            }));
        }
    }

    /**
     * Data model object to represent a transaction.
     * Coerces a Hash/Object into something we can use as institution to at least typecast the
     * structure as we need it here.
     */
    class Transaction extends JSONable {
        static Types = {
            Credit: 'credit',
            Debit: 'debit',
            Transfer: 'transfer',
            Payment: 'payment',
        }

        constructor(data={}) {
            super(['id', 'accountId', 'description', 'datePending', 'datePosted', 'transactionType',
              'amount', 'tax', 'currency', 'merchant', 'tags']);
            this.id = data.id || '';
            this.accountId = data.accountId || '';
            this.description = data.description || '';
            this.datePending = data.datePending || NULLDATE;
            this.datePosted = data.datePosted || NULLDATE;
            this.transactionType = data.transactionType || null;
            this.amount = data.amount || 0.0;
            this.tax = data.tax || 0.0;
            this.currency = data.currency || '';
            this.merchant = data.merchant || '';
            this.tags = data.tags || [];

            // This might be a bug later. Can I make such an assumption?
            this.datePending instanceof Date || (this.datePending = new Date(data.datePending));
            this.datePosted instanceof Date || (this.datePosted = new Date(data.datePosted));
        }
    }

    /**
     * Object to store settings and interfaces with the localStorage in order to accomplish this.
     */
    class Settings {

        static tagTypes = [
            'income',
            'expense',
            'transfer',
            'hide'
        ];

        constructor() {
            this.load();
        }

        /**
         * Save this instance of settings to localStorage so settings persist.
         */
        save() {
            Settings.tagTypes.forEach(ref => {
                localStorage.setItem(ref, this[ref]);
            });
            localStorage.setItem('payCycle', this.payCycle);
            return this;
        }

        /**
         * Read the local storage for our settings.
         */
        load() {
            Settings.tagTypes.forEach(ref => {
                var k = `${ref}Tags`;
                this[k] = localStorage.getItem(k) || [];
            });
            this.payCycle = localStorage.getItem('payCycle') || PayCycle.BiMonthly;
        }
    }

    /**
     * @property {string} TransactionFields
     * Constant. List of top-level member fields that represent a transaction.
     */
    const TransactionFields = Object.freeze( Object.keys( new Transaction() ) );

    Yaba.hasOwnProperty('models') || (Yaba.models = {});
    Yaba.models.NULLDATE            = NULLDATE;
    Yaba.models.PayCycle            = PayCycle;
    Yaba.models.TransactionFields   = TransactionFields;
    Yaba.models.Institution         = Institution;
    Yaba.models.Account             = Account;
    Yaba.models.Transaction         = Transaction;
    Yaba.models.Settings            = Settings;

    return Yaba;
})(Yaba);
