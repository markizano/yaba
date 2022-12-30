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

    class InstitutionMappingException extends Error {
        constructor(fromField, toField) {
            super(`Institution Mapping should contain one of "${Yaba.models.TransactionFields.join(", ")}". Got ${toField} when setting ${fromField}`);
            this.name = this.constructor.name;
        }
    }

    class Storable {
        save($scope) {
            return () => {
                let event = `save.${this._class}`;
                console.log(`JSONable.save(${event})`);
                $scope.$emit(event, this);
            };
        }

        load($scope) {
            return () => {
                var data = JSON.parse( localStorage.getItem(this._class) || '{}' );
                return $scope[this._class] = new this._class(data);
            }
        }
    }

    class JSONable extends Storable {
        constructor(keys, child=undefined) {
            super();
            this._keys = Object.freeze(keys);
            this._class = child;
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
            super(['id', 'name', 'description', 'mappings'], 'institution');
            this.update(data);
        }

        update(data) {
            this.id = data.id || uuid.v4();
            this.name = data.name || '';
            this.description = data.description || '';
            this.mappings = [];
            if ( data.hasOwnProperty('mappings') ) {
                data.mappings.forEach((mapping) => {
                    if ( !Yaba.models.TransactionFields.includes(mapping.toField) ) {
                        throw new InstitutionMappingException(mapping.fromField, mapping.toField);
                    }
                    this.mappings.push({
                        fromField: mapping.fromField || '',
                        toField: mapping.toField || '',
                        mapType: mapping.mapType || null
                    });
                });
            } else {
                this.mappings.push({
                    fromField: '',
                    toField: '',
                    mapType: null
                });
            }
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
              'interestRate', 'interestStrategy', 'transactions'], 'account');
            data = this.scrubInput(data);
            this.update(data);
        }

        /**
         * Ensure we have assigned the desired data structure to each data point.
         * @param {Object} data Inputs to scrub.
         * @returns scrubbed results
         */
        scrubInput(data) {
            if ( data.institutionId && data.institutionId instanceof Institution ) {
                data.institutionId = data.institutionId.id;
            }
            return data;
        }

        /**
         * Updates this object with any data one might have for updates.
         * @param {Object} data Input data to update for this object.
         */
        update(data) {
            this.id = data.id || uuid.v4();
            this.institutionId = data.institutionId || '';
            this.name = data.name || '';
            this.description = data.description || '';
            this.balance = data.balance || 0.0;
            this.accountType = data.accountType || null;
            this.number = data.number || '';
            this.routing = data.routing || '';
            this.interestRate = Number(data.interestRate) || 0.0;
            this.interestStrategy = data.interestStrategy || null;
            if ( !this.hasOwnProperty('transactions') ) {
                this.transactions = [];
            }
            if ( data.hasOwnProperty('transactions') && data.transactions instanceof Array ) {
                data.transactions.forEach((transaction) => {
                    if ( !transaction instanceof Transaction ) {
                        transaction = new Transaction(transaction);
                    }
                    this.transactions.push(transaction);
                });
            }
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
              'amount', 'tax', 'currency', 'merchant', 'tags'], 'transaction');
            data = this.scrubInput(data);
            this.id = data.id || uuid.v4();
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
        }

        /**
         * Scrubs input from user stuffs and asserts the data types we expect.
         * @param {Object} data input data to scrub and typecast.
         * @return {object} Transformed data with typecasting done.
         */
        scrubInput(data) {
            if ( data.datePending && ! data.datePending instanceof Date ) {
                data.datePending = new Date(data.datePending);
            }
            if ( data.datePosted && ! data.datePosted instanceof Date ) {
                data.datePosted = new Date(data.datePosted);
            }
            if ( data.amount && typeof data.amount == 'string' ) {
                data.amount = Number(data.amount.replace(/[^0-9\.-]+/g, '') );
            }
            if ( data.tags && typeof data.tags == 'string' ) {
                data.tags = data.tags.split(',').map(x => x.trim());
            }
            return data;
        }
    }

    /**
     * Object to store settings and interfaces with the localStorage in order to accomplish this.
     */
    class Settings extends JSONable {
        constructor(data={}) {
            super(['incomeTags', 'expenseTags', 'transferTags', 'hideTags', 'payCycle'], 'settings');
            this.incomeTags = data.incomeTags || [];
            this.expenseTags = data.expenseTags || [];
            this.transferTags = data.transferTags || [];
            this.hideTags = data.hideTags || [];
            this.payCycle = data.payCycle || PayCycle.BiMonthly;
        }

        /**
         * Save this instance of settings to localStorage so settings persist.
         */
        save() {
            localStorage.setItem('settings', this.toString());
            return this;
        }

        /**
         * Read the local storage for our settings.
         */
        load() {
            var data = JSON.parse( localStorage.getItem('settings') || '{}' );
            this.incomeTags = data.incomeTags || [];
            this.expenseTags = data.expenseTags || [];
            this.transferTags = data.transferTags || [];
            this.hideTags = data.hideTags || [];
            this.payCycle = data.payCycle || PayCycle.BiMonthly;
            return this;
        }
    }

    /**
     * Extension of an array to give us access to a list of items.
     * Still send an event when saving needs to occur.
     * Ability to find objects by ID and Name.
     * More may come as we find additional use cases for a list/collection.
     */
    class InstitutionCollection extends Array {

        __defineSetter__(prop, value) {
            console.log('institution.__defineSetter__()');
            console.log({prop: prop, value: value});
            return super.__defineSetter__(value);
        }

        push(item) {
            console.log(item);
            item instanceof Institution || (item = new Institution(item));
            return super.push(item);
        }

        unshift(item) {
            item instanceof Institution || (item = new Institution(item));
            return super.unshift(item);
        }

        save($scope) {
            console.log('Emitting save.institutions event...');
            $scope.$emit('save.institutions', this);
            return this;
        }

        findById(id) {
            return this.filter(i => i.id == id).pop() || null;
        }

        findByName(name) {
            return this.filter(i => i.name == name).pop() || null;
        }

        toString() {
            var result = [];
            this.map((x) => { result.push(x.toObject()); });
            return JSON.stringify(result);
        }

        store() {
            console.log('Saving institutions...');
            localStorage.setItem( 'institutions', this.toString() );
        }
    }

    class AccountCollection extends Array {

        push(item) {
            item instanceof Account || (item = new Account(item));
            return super.push(item);
        }

        unshift(item) {
            item instanceof Account || (item = new Account(item));
            return super.unshift(item);
        }

        save($scope) {
            $scope.$emit('save.accounts', this);
            return this;
        }

        findById(id) {
            return this.filter(i => i.id == id).pop() || null;
        }

        findByName(name) {
            return this.filter(i => i.name == name).pop() || null;
        }

        toString() {
            var result = [];
            this.forEach((x) => { result.push(x.toObject()); });
            return JSON.stringify(result);
        }

        store() {
            console.log('Saving accounts...');
            localStorage.setItem( 'accounts', this.toString() );
        }
    }

    /**
     * @property {string} TransactionFields
     * Constant. List of top-level member fields that represent a transaction.
     */
    const TransactionFields = Object.freeze( Object.keys( new Transaction() ).filter(x => x[0] != '_') );

    Yaba.hasOwnProperty('models') || (Yaba.models = {});
    Yaba.models.NULLDATE            = NULLDATE;
    Yaba.models.PayCycle            = PayCycle;
    Yaba.models.TransactionFields   = TransactionFields;
    Yaba.models.Institution         = Institution;
    Yaba.models.Account             = Account;
    Yaba.models.Transaction         = Transaction;
    Yaba.models.Settings            = Settings;
    Yaba.models.Institutions        = InstitutionCollection;
    Yaba.models.Accounts            = AccountCollection;
    // Yaba.models.Transactions        = TransactionCollection;

    return Yaba;
})(Yaba);
