/**
 * Models around Yaba controllers. Tie HTTP calls and data together.
 */
(function(Yaba) {
    'use strict';

    /**
     * @param {Date} NULLDATE Object we can use for NULL but also instanceof Date().
     */
    const NULLDATE = new Date('1970-01-01T00:00:');

    /**
     * @class Exception to make it clear this is a Yaba exception we are raising.
     */
    class InstitutionMappingException extends Error {
        constructor(fromField, toField) {
            super(`Institution Mapping should contain one of` +
              ` "${TransactionFields.join('", "')}". ` +
              `Got "${toField}" when setting "${fromField}"`);
            this.name = this.constructor.name;
        }
    }

    /**
     * @class Exception to make it clear this is a Yaba exception we are raising.
     */
    class InstitutionMapTypeException extends Error {
        constructor(fromField, toField, mapType) {
            super(`Institution Map Type should contain one of` +
              ` "${InstitutionMapping.MapTypes.join(", ")}". ` +
              `Got "${mapType}" when setting "${fromField}" to "${toField}"`);
            this.name = this.constructor.name;
        }
    }

    class InstitutionUnzipException extends Error {
        constructor() {
            super(...arguments);
            this.name = this.constructor.name;
        }
    }

    /**
     * Base object that will enable us to store and load our informations.
     */
    class Storable {
        save($scope) {
            let event = `save.${this.constructor.name.toLowerCase()}`;
            console.info('JSONable.save()', event);
            return $scope.$emit(event, this);
        }
    }

    class Storables extends Array {

        clear() {
            this.length = 0;
        }

        store() {
            const storeItem = this.constructor.name.toLowerCase();
            console.info(`Storables.store(${storeItem})`);
            localStorage.setItem(storeItem, this.toString());
        }
    }
    Storables.prototype.save = Storable.prototype.save;
    Storables.prototype.load = Storable.prototype.load;

    
    class JSONable extends Storable {
        constructor(keys) {
            super();
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

    class JSONables extends Storables {

        byId(id) {
            return this.filter(i => i.id == id).pop() || null;
        }

        byName(name) {
            return this.filter(i => i.name == name).pop() || null;
        }

        toString() {
            var result = [];
            this.forEach((x) => { result.push(x.toObject()); });
            return JSON.stringify(result);
        }
    }

    /**
     * InstitutionMapping objectlet for Institution().mappings. This has been used enough to make it a real
     * thing we can use for importing/exporting and otherwise managing institution mappings.
     */
    class InstitutionMapping {
        /**
         * @property {Array} MapTypes Valid mapping types. To later support function() types as well for things
         * like change the sign and make it negative, perform a regexp replacement on a description or perform
         * some calculation based on related fields in this transaction.
         */
        static MapTypes = Object.freeze([ 'static', 'dynamic' ]);

        constructor(fromField, toField, mapType) {
            if ( toField !== '' && !TransactionFields.includes(toField) ) {
                console.warn('fields: ', fromField, toField, mapType);
                throw new InstitutionMappingException(fromField, toField);
            }
            if ( mapType !== null && !InstitutionMapping.MapTypes.includes(mapType) ) {
                throw new InstitutionMapTypeException(fromField, toField, mapType);
            }
            this.fromField = fromField;
            this.toField = toField;
            this.mapType = mapType;
            // @TODO: Find a way to make this work off the DOM. I Don't like including this in the object itself.
            // This feels too kludgy.
            Object.defineProperty(this, 'visible', {
                enumerable: false,
                writable: true,
                value: false
            });
        }

        hide() {
            this.visible = false;
            return this;
        }

        show() {
            this.visible = true;
            return this;
        }

        /**
         * Override for this.toString();
         * @returns {String}
         */
        toString() {
            return JSON.stringify({
                fromField: this.fromField,
                toField: this.toField,
                mapType: this.mapType
            });
        }
    }

    class InstitutionMappings extends Array {
        constructor(...items) {
            if ( items.length > 0 && typeof items[0] !== 'number' ) {
                for ( let i in items ) {
                    let item = items[i];
                    if ( item instanceof InstitutionMapping ) {
                        continue
                    }
                    items[i] = new InstitutionMapping(item.fromField, item.toField, item.mapType);
                }
            }
            super(...items);
        }

        /**
         * Override of the push() function to ensure that each item added to the array is of type `InstitutionMapping`.
         * @param  {...InstitutionMapping|object} items Items to push onto the array.
         * @returns Number of items in the current set/array.
         */
        push(...items) {
            for ( let i in items ) {
                let item = items[i];
                item instanceof InstitutionMapping || (items[i] = new InstitutionMapping(item.fromField, item.toField, item.mapType));
            }
            return super.push(...items);
        }

        /**
         * Override of unshift() to check if item added is an instance of a InstitutionMapping() or not
         * to ensure we only ever contain a list of InstitutionMappings.
         * @param  {...any} items Any list of arguments of items to add as InstitutionMapping()
         * @returns Number of items unshift()ed.
         */
        unshift(...items) {
            for (let i in items) {
                let item = items[i];
                item instanceof InstitutionMapping || (items[i] = new InstitutionMapping(item.fromField, item.toField, item.mapType));
            }
            return super.unshift(...items);
        }

        /**
         * Override for this.toString();
         * @returns {String}
         */
        toString() {
            return JSON.stringify(this);
        }

        /**
         * Handy method to show all in the collection.
         */
        show() {
            this.forEach(i => i.show());
            return this;
        }

        /**
         * Handy method to hide all in the collection.
         */
        hide() {
            this.forEach(i => i.hide());
            return this;
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
            this.id = data.id || uuid.v4();
            this.name = data.name || '';
            this.description = data.description || '';
            this.mappings = data.mappings? new InstitutionMappings(...data.mappings): new InstitutionMappings();
        }

        /**
         * Allows upsert updates to this object. Enable ability to update many fields without
         * having to set them all if we don't need to. Also can update by providing this object
         * to itself with overlayed updates.
         * @param {Object} data Data to use to update this object.
         * @returns Institution
         */
        update(data) {
            data.id && (this.id = data.id);
            data.name && (this.name = data.name);
            data.description && (this.description = data.description);
            data.mappings && (this.mappings = new InstitutionMappings(...data.mappings));
            return this;
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
            data = this.typecast(data);
            this.id = data.id || uuid.v4();
            this.institutionId = data.institutionId || '';
            this.name = data.name || '';
            this.description = data.description || '';
            // this.balance = data.balance || 0.0;
            this.accountType = data.accountType || null;
            this.number = data.number || '';
            this.routing = data.routing || '';
            this.interestRate = Number(data.interestRate) || 0.0;
            this.interestStrategy = data.interestStrategy || null;
            this.transactions = data.hasOwnProperty('transactions')? new Transactions(...data.transactions): new Transactions();
        }

        /**
         * Typecast the data we get from outside of this object.
         * @param {Object} data Inputs to scrub.
         * @returns scrubbed results
         */
        typecast(data) {
            // if ( data.balance && ! typeof data.balance == 'number' ) {
            //     data.balance = Math.parseCurrency(data.balance);
            // }
            if ( data.institutionId && data.institutionId instanceof Institution ) {
                data.institutionId = data.institutionId.id;
            }
            if ( data.interestRate && typeof data.interestRate != 'number' ) {
                data.interestRate = Number(data.interestRate);
            }
            if ( data.transactions
              && ! (data.transactions instanceof Transactions) ) {
                data.transactions = new Transactions(...data.transactions);
            }
            return data;
        }

        /**
         * Updates this object with any data one might have for updates.
         * @param {Object} data Input data to update for this object.
         */
        update(data) {
            data = this.typecast(data);
            data.id                 && (this.id = data.id);
            data.institutionId      && (this.institutionId = data.institutionId);
            data.name               && (this.name = data.name);
            data.description        && (this.description = data.description);
            // data.balance            && (this.balance = data.balance);
            data.accountType        && (this.accountType = data.accountType);
            data.number             && (this.number = data.number);
            data.routing            && (this.routing = data.routing);
            data.interestRate       && (this.interestRate = Number(data.interestRate));
            data.interestStrategy   && (this.interestStrategy = data.interestStrategy);
            if ( !this.hasOwnProperty('transactions') ) {
                this.transactions = new Transactions();
            }
            if ( data.hasOwnProperty('transactions') && data.transactions instanceof Array ) {
                this.transactions.push(...data.transactions);
            }
        }

        /**
         * Balance as a function will allow us to traverse the current transaction list.
         * @returns {Number} The current running balance of this account.
         */
        balance() {
            let result = 0.0;
            this.transactions.map(txn => result += txn.amount);
            return result;
        }
    }

    /**
     * Data model object to represent a transaction.
     * Coerces a Hash/Object into something we can use as institution to at least typecast the
     * structure as we need it here.
     * Also performs typecasting to ensure we have Date() object for date related fields and
     * Number() types for numeric fields, etc.
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
            data = this.typecast(data);
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
         * Typecast the data we get from outside of this object.
         * @param {Object} data input data to scrub and typecast.
         * @return {object} Transformed data with typecasting done.
         */
        typecast(data) {
            if (typeof data != 'object') {
                return data;
            }
            if ( data.datePending && ! (data.datePending instanceof Date) ) {
                data.datePending = new Date(data.datePending);
            }
            if ( data.datePosted ) {
                if ( ! (data.datePosted instanceof Date) ) {
                    data.datePosted = new Date(data.datePosted);
                }
            }
            if ( data.amount && typeof data.amount == 'string' ) {
                data.amount = Math.parseCurrency(data.amount); 
            }
            if ( data.tags && typeof data.tags == 'string' ) {
                data.tags = data.tags.split(',').map(x => x.trim());
            }
            return data;
        }

        update(data) {
            data = this.typecast(data);
            data.id                 && (this.id = data.id);
            data.accountId          && (this.accountId = data.accountId);
            data.description        && (this.description = data.description);
            data.datePending        && (this.datePending = data.datePending);
            data.datePosted         && (this.datePosted = data.datePosted);
            data.transactionType    && (this.transactionType = data.transactionType);
            data.amount             && (this.amount = data.amount);
            data.tax                && (this.tax = data.tax);
            data.currency           && (this.currency = data.currency);
            data.merchant           && (this.merchant = data.merchant);
            data.tags               && (this.tags = data.tags);
        }

        hasTag(tag) {
            return this.tags.includes(tag);
        }

        setTag(tag) {
            if ( ! this.hasTag(tag) ) {
                this.addTag(tag);
            }
            return this;
        }

        addTag(tag) {
            this.tags.push(tag);
            return this;
        }

        YYYYMM() {
            return this.datePosted.toISOShortDate().split('-', 2).join('-');
        }
    }

    /**
     * Object to store settings and interfaces with the localStorage in order to accomplish this.
     */
    class Settings extends JSONable {

        /**
         * enum(PayCycle). Set of key-value pairs of pay cycles.
         */
        static PayCycle = Object.freeze({
            Weekly: 'weekly',
            BiWeekly: 'bi-weekly',
            BiMonthly: 'bi-monthly',
            Monthly: 'monthly',
        });

        /**
         * enum(TransactionDeltas). Possible default transaction history values
         * we'd use when rendering transaction history.
         */
        static TransactionDeltas = Object.freeze({
            days30:  2592000000,
            days60:  5184000000,
            days90:  7776000000,
            days180: 15552000000,
            days365: 31104000000,
            days730: 62208000000,
        });

        constructor(data={}) {
            super(['incomeTags', 'expenseTags', 'transferTags', 'hideTags', 'payCycle', 'txnDelta'], 'settings');
            this.incomeTags = data.incomeTags || [];
            this.expenseTags = data.expenseTags || [];
            this.transferTags = data.transferTags || [];
            this.hideTags = data.hideTags || [];
            this.payCycle = data.payCycle || Settings.PayCycle.Weekly;
            this.txnDelta = data.txnDelta || Settings.TransactionDeltas.days30;
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
            this.payCycle = data.payCycle || Settings.PayCycle.Weekly;
            this.txnDelta = data.txnDelta || Settings.TransactionDeltas.days30;
            return this;
        }

        payCycle2ms(cycle) {
            switch (cycle) {
                case Settings.PayCycle.Weekly:
                    return 7 * 24 * 60 * 60 * 1000;
                case Settings.PayCycle.BiWeekly:
                    return 14 * 24 * 60 * 60 * 1000;
                case Settings.PayCycle.BiMonthly:
                    var next1st = new Date();
                    next1st.setDate(1);
                    next1st.setMonth(next1st.getMonth() + 1);
                    var next15th = new Date();
                    next15th.setDate(15);
                    next15th.setMonth(next15th.getMonth() + 1);
                    return (next15th - next1st);
                case Settings.PayCycle.Monthly:
                    var next1st = new Date();
                    next1st.setDate(1);
                    next1st.setMonth(next1st.getMonth() + 1);
                    return (next1st - new Date());
            }
        }
    }

    /**
     * Extension of an array to give us access to a list of items.
     * Still send an event when saving needs to occur.
     * Ability to find objects by ID and Name.
     * More may come as we find additional use cases for a list/collection.
     */
    class Institutions extends JSONables {

        push(...items) {
            for ( let i in items ) {
                let item = items[i];
                item instanceof Institution || (items[i] = new Institution(item));
            }
            return super.push(...items);
        }

        unshift(...items) {
            for (let i in items) {
                let item = items[i];
                item instanceof Institution || (items[i] = new Institution(item));
            }
            return super.unshift(...items);
        }

        /**
         * Produce a CSV result of the contents of this object.
         * @returns {String}
         */
        toCSV(jszip) {
            if ( this.length == 0 ) {
                return jszip;
            }
            let institutionZIP = ['"id","name","description"'];
            let mappingZIP = ['"institutionId","fromField","toField","mapType"'];
            this.map(institution => {
                let iFields = [institution.id, institution.name, institution.description];
                institutionZIP.push(`"${iFields.join('","')}"`);
                institution.mappings.map(mapping => {
                    let mFields = [institution.id, mapping.fromField, mapping.toField, mapping.mapType];
                    mappingZIP.push(`"${mFields.join('","')}"`);
                });
            });
            jszip.file('institutions.csv', institutionZIP.join("\n"));
            jszip.file('institution-mappings.csv', mappingZIP.join("\n"));
            return jszip;
        }

        /**
         * If you don't want in-place changes, please use slice() or concat() before calling this method.
         * Input CSV file and result in this object being populated with the contents of previous call to
         * toCSV(JSZip).
         * @mutates
         * @param {JSZip} jsz The JSZip instance that has already loaded the ZIP contents from the end-user.
         * @returns {Promise<Institutions>}
         */
        async fromZIP(jsz) {
            this.length = 0; // reset the instance to an empty list.
            const papaOpts = { header: true, skipEmptyLines: true };
            let institutionsCSV = await jsz.files['institutions.csv'].async('text'),
              mappingCSV = await jsz.files['institution-mappings.csv'].async('text');
            let parsedInstitutions = Papa.parse(institutionsCSV, papaOpts);
            let parsedMappings = Papa.parse(mappingCSV, papaOpts);
            this.push(...parsedInstitutions.data);
            parsedMappings.data.forEach(mappings =>
                this.byId(mappings.institutionId).mappings.push({
                    fromField: mappings.fromField,
                    toField: mappings.toField,
                    mapType: mappings.mapType
                })
            );
            console.info(`Parsed ${this.length} Institutions from CSV file for ${this.map(i => i.mappings.length).reduce((a,b) => a += b, 0)} mappings.`);
        }

        /**
         * Get an institution by ID.
         * @param {String} ID Institution ID to fetch
         * @returns {Institution}
         */
        byId(ID) {
            return this.filter(i => i.id == ID).shift();
        }

        static csvHandler($scope, $timeout) {
            return ($event, results) => {
                // only get back the headers from the CSV file.
                var headers = Object.keys(results.parsedCSV.data.shift());
                $scope.institution.mappings = [];
                headers.forEach((h) => {
                    // Store in variable for later use in function return value.
                    // Also: Assign before appending to the list to ensure we use the index we are
                    //   setting. (avoids out of index error)
                    let i = $scope.institution.mappings.length;
                    $scope.institution.mappings.push({
                        fromField: h,
                        toField: '',
                        mapType: 'dynamic'
                    });
                    // Set a timeout to alter the visibility immediately after the element has been
                    // rendered on the page to enable the animation.
                    $timeout(() => {
                        $scope.institution.mappings[i].show();
                    }, 100);
                });
                // Let AngularJS know about this since the papaparser breaks the promise chain.
                $scope.$apply();
            };
        }
    }

    /**
     * Representation of an Account collection that you can render as JSON when converted to string.
     * Allows for operations on a per-account basis.
     * Also allows for defining handy functions that we'd use as filters.
     */
    class Accounts extends JSONables {
        constructor(...items) {
            if ( items.length > 0 && typeof items[0] !== 'number' ) {
                for ( let i in items ) {
                    let item = items[i];
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
        push(...items) {
            for ( let i in items ) {
                let item = items[i];
                item instanceof Account || (items[i] = new Account(item));
            }
            return super.push(...items);
        }

        /**
         * Override to Array.unshift().
         * @param  {...Account} items New Account(s) to add to this collection.
         * @returns {Number} Current number of items after adding.
         */
        unshift(...items) {
            for (let i in items) {
                let item = items[i];
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
        remove(ID) {
            for ( let i=0; i < this.length; i++ ) {
                let item = this[i];
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
        byId(ID) {
            return this.filter(acct => acct.id == ID).shift();
        }

        /**
         * Override includes method to consider class or account.id.
         * @param {String|Account} item Item to check against inclusion.
         * @returns {Boolean}
         */
        includes(item) {
            let itemId;
            if ( item instanceof Account ) {
                itemId = item.id;
            } else {
                itemId = item;
            }
            return !!this.filter(x => x instanceof Account? x.id: x == itemId).length;
        }

        /**
         * Gets the unique set of tags from the transactions of this account.
         * @returns {Array<String>} The list of tags from the transactions in this list.
         */
        getTags() {
            return Array.from(new Set( this.map(a => a.transactions.getTags()).flat().sort() ));
        }

        /**
         * Get the list of transactions that match the filters.
         * @returns {Transactions} New list of transactions that match the search criteria.
         */
        getTransactions(selectedAccounts, fromDate, toDate, description=undefined, tags=undefined, limit=-1) {
            const result = new Transactions();
            let searchResults = this.selected(selectedAccounts).map(
                a => a.transactions.getTransactions(
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
        toCSV(jszip) {
            if ( this.length == 0 ) {
                return jszip;
            }
            let accountsZIP = ['"id","institutionId","name","description"' +
              ',"accountType","number","routing","interestRate","interestStrategy"'];
            this.forEach(account => {
                let aFields = [
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
        async fromZIP(jszip) {
            this.length = 0;
            const papaOpts = { header: true, skipEmptyLines: true };
            let accountsCSV = await jszip.files['accounts.csv'].async('text');
            let parsedAccounts = Papa.parse(accountsCSV, papaOpts);
            this.push(...parsedAccounts.data);
            for ( let account of this ) {
                await account.transactions.fromZIP(account.id, jszip);
                console.info(`> Parsed out ${account.transactions.length} transactions for account "${account.name}".`);
            }
            console.info(`Parsed ${this.length} Accounts from CSV file for ${this.map(a => a.transactions.length).reduce((a,b) => a += b, 0)} transactions.`);
        }

        /**
         * Execute on the filtering of accounts based on what was selected.
         * @param {String|Account|Array<String>|Array<Account>|Accounts} selectedAccounts The selected accounts to filter against.
         * @returns The accounts that match what was listed in the provided item or collection.
         */
        filterSelected(account, selectedAccounts) {
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
        selected(selectedAccounts) {
            return this.filter(a => this.filterSelected(a, selectedAccounts));
        }

    }

    class Transactions extends JSONables {
        constructor(...items) {
            if ( items.length > 0 && typeof items[0] !== 'number' ) {
                for ( let i in items ) {
                    let item = items[i];
                    if ( ! ( item instanceof Transaction ) ) {
                        items[i] = new Transaction(item);
                    }
                }
            }
            super(...items);
        }

        /**
         * Override of the push() function to ensure that each item added to the array is of type `Transaction`.
         * @param  {...Transaction|object} items 
         * @returns Number of items in the current set/array.
         */
        push(...items) {
            for ( let i in items ) {
                let item = items[i];
                item instanceof Transaction || (items[i] = new Transaction(item));
            }
            return super.push(...items);
        }

        /**
         * Override of unshift() to check if item added is an instance of a Transaction() or not
         * to ensure we only ever contain a list of Transactions.
         * @param  {...any} items Any list of arguments of items to add as Transaction()
         * @returns Number of items unshift()ed.
         */
        unshift(...items) {
            for (let i in items) {
                let item = items[i];
                item instanceof Transaction || (items[i] = new Transaction(item));
            }
            return super.unshift(...items);
        }

        /**
         * Removes an item from this collection. Easier to understand than [].splice() since
         * we are using the ID field.
         * @param {String} ID The ID field to remove.
         * @returns {Transactions} New Mutated array no longer containing the transaction.
         *   returns itself if no action was taken.
         */
        remove(ID) {
            for ( let i=0; i < this.length; i++ ) {
                let item = this[i];
                if (item.id == ID) {
                    return this.splice(i, 1);
                }
            }
            return this;
        }


        /**
         * Produce a CSV result of the contents of this object.
         * @returns {String}
         */
        toCSV() {
            if ( this.length == 0 ) {
                return '';
            }
            let transactionsZIP = ['"id","accountId","description","datePending","datePosted"' +
                ',"transactionType","amount","tax","currency","merchant","tags"'];
            this.map(transaction => {
                let tFields = [
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
        async fromZIP(accountId, jszip) {
            this.clear();
            const papaOpts = { header: true, skipEmptyLines: true };
            let transactionCSV = await jszip.files[`transactions_${accountId}.csv`].async('text');
            let parsedTransactions = Papa.parse(transactionCSV, papaOpts);
            this.push(...parsedTransactions.data.map(txn => {
                txn.tags = txn.hasOwnProperty('tags') ? txn.tags.split("|").filter(x => x) : [];
                return txn;
            }));
        }

        /**
         * Get the list of tags we have for this transaction collection.
         * @returns {Array<String>} List of tags associated with this collection of transactions.
         */
        getTags() {
            return Array.from(new Set(this.filter(t => t.tags.length).map(t => t.tags).flat().sort()));
        }

        /**
         * Filter method for returning the date range specified.
         * @param {Transaction} txn The transaction for the filter iteration
         * @returns {Boolean} TRUE|FALSE based on if this txn is in the specified date range.
         */
        filterDaterange(txn, fromDate, toDate) {
            if ( typeof fromDate == 'string' ) {
                fromDate = new Date(fromDate);
            }
            if ( typeof toDate == 'string' ) {
                toDate = new Date(toDate);
            }
            
            if ( typeof txn.datePosted == 'string' ) {
                txn.datePosted = new Date(txn.datePosted);
            }
            let recent = txn.datePosted >= fromDate;
            let older = txn.datePosted <= toDate;
            return recent && older;
        }

        /**
         * Filters out based on accountId even if what is provided is more than just a string.
         * @param {String|Account} accountId
         * @returns {Boolean}
         */
        filterAccountId(txn, accountId) {
            return txn.accountId == (accountId instanceof Account? accountId.id: accountId);
        }

        /**
         * Filters out based on a list or collection of accountIds even if what is provided is more than just a string.
         * @param {String|Account} accountId
         * @returns {Boolean}
         */
        filterAccountIds(txn, accountIds) {
            return accountIds instanceof Accounts? accountIds.includes(txn.accountId):
              (new Accounts(accountIds)).includes(txn.accountId);
        }

        /**
         * Filter by description.
         * @param {Transaction} txn Transaction by this.filter() function.
         * @param {String|undefined} description String description to filter against. Will match in .merchant or in .description.
         * @returns {Boolean} TRUE|FALSE if we find this in the description.
         */
        filterDescription(txn, description) {
            // Assign as booleans to check if any in match.
            const inMerchant = txn.merchant.toLowerCase().indexOf(description.toLowerCase()) !== -1;
            const inDescription = txn.description.toLowerCase().indexOf(description.toLowerCase()) !== -1;
            return inMerchant || inDescription;
        }

        /**
         * Filter by RegExp(description).
         * @param {Transaction} txn Transaction by this.filter() function.
         * @param {RegExp|undefined} description RegExp description to filter against. Will match in .merchant or in .description.
         * @returns {Boolean} TRUE|FALSE if we find this in the string columns of a transaction.
         */
        filterDescription(txn, description) {
            // Assign as booleans to check if any in match.
            const inMerchant = txn.merchant.toLowerCase().indexOf(description.toLowerCase()) !== -1;
            const inDescription = txn.description.toLowerCase().indexOf(description.toLowerCase()) !== -1;
            return inMerchant || inDescription;
        }

        /**
         * Check to see if tag is attached to this transaction.
         * @param {Transaction} txn Transaction as provided by this.filter();
         * @param {String|undefined} tag The tag to match against.
         * @returns TRUE|FALSE for `this.filter()` use on if this tag exists on this transaction or not.
         */
        filterTag(txn, tag) {
            return txn.tags.includes(tag);
        }

        /**
         * Check to see if the collection of tags is attached to this transaction. Match ANY.
         * @param {Transaction} txn Transaction as provided by this.filter();
         * @param {Array<String>|undefined} tags The tags to match against.
         * @returns TRUE|FALSE for `this.filter()` use on if this tag exists on this transaction or not.
         */
        filterTags(txn, tags) {
            return txn.tags.some(tag => tags === undefined? true: tags.includes(tag));
        }

        /**
         * Filters out transactions by date. Gives a Transaction collection
         * within a time range between two dates.
         * @param {Date} fromDate No transactions older than this date.
         * @param {Date} toDate No transactions newer than this date.
         * @returns {Transactions}
         */
        daterange(fromDate, toDate) {
            return this.filter((txn) => this.filterDaterange(txn, fromDate, toDate));
        }

        /**
         * Gimmie this transaction by ID.
         * Since the ID is unique, this will only ever return 1 element.
         * @param {String} ID The transaction.id we want to find.
         * @returns {Transaction} The transaction object by reference.
         */
        byId(ID) {
            return this.filter(txn => txn.id == ID).shift();
        }

        /**
         * In the case that we have multiple accounts transactions in this collection,
         * this allows us to filter them out so we only have transactions of a specific
         * accountId.
         * @param {uuid.v4} accountId The account ID to filter.
         * @returns {Transactions} List of transactions only by accountId
         */
        byAccountId(accountId) {
            return this.filter((txn) => this.filterAccountId(txn, accountId));
        }

        /**
         * In the case that we have multiple accounts transactions in this collection,
         * this allows us to filter them out so we only have transactions of a specific
         * accountId.
         * @param {uuid.v4} accountId The account ID to filter.
         * @returns {Transactions} List of transactions only by accountId
         */
        byAccountIds(accountIds) {
            return this.filter((txn) => this.filterAccountIds(txn, accountIds));
        }

        /**
         * Gets a list of transactions that match the description.
         * @param {String|RegExp} description The description to match against.
         * @returns {Transactions} The list of matching transactions.
         */
        byDescription(description) {
            return this.filter(txn => this.filterDescription(txn, description));
        }

        /**
         * Filter the list of transactions by tag.
         * @param {String} tag Filter the list of transactions by tag.
         * @returns {Transactions}
         */
        byTag(tag) {
            return this.filter(txn => this.filterTag(txn, tag));
        }

        /**
         * Filter the list of transactions by a collection of matching tags.
         * @param {Array} tags Filter the list of transactions by a set of tags.
         * @returns {Transactions}
         */
        byTags(tags) {
            return this.filter(txn => this.filterTags(txn, tags));
        }

        /**
         * In place mutation method to set a tag across all the selected transactions in this collection.
         * @param {String} tag The Tag to associate with all these transactions.
         * @returns {Transactions} Updated copy of transactions with this tag set on all of them.
         */
        setTag(tag) {
            return this.concat().map(txn => txn.setTag(tag));
        }

        /**
         * Get me a copy of transactions that have a tag, any tag set.
         * @returns {Transactions} new list of transactions that have a tag set.
         */
        haveTags() {
            return this.filter(t => t.tags.length > 0);
        }

        /**
         * Reduce this set of transactions down to get the list of budgets in alpha order with
         * transaction amounts associated with them.
         * @returns {Array<{tag: String, amount: Number}>} List of budgets to render in the widget.
         * For example, for each transaction that has a "Grocery" tag on it, it will be sum()d up
         * and result as a single {"Groceries": $amount} object in the resulting Array().
         */
        getBudgets() {
            // Map each transaction to a {tag, amount} object.
            const tag2amount = t => t.tags.map(tag => ({tag, amount: t.amount}) );
            // Sort by tag near the end of this operation.
            const sortByTags = (a, b) => a.tag.toLowerCase() > b.tag.toLowerCase()? 1: -1;
            // Reducer method for filtering out duplicates into a unique
            // list of budgets with the amounts aggregated.
            const sumTags = (budgets, txn) => {
                txn.forEach(cv => {
                    let a = budgets.filter(x => x.tag == cv.tag);
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
                    return this.haveTags().map(tag2amount).reduce(sumTags, []).sort(sortByTags);
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
        sum() {
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
        avg() {
            return this.length > 0? this.sum() / this.length: 0;
        }

        /**
         * Sorts the array based on datePosted.
         * @param {boolean} asc TRUE for Ascending; FALSE for Descending.
         * @returns {Transactions} The sorted list of transactions by datePosted.
         */
        sorted(asc=true) {
            return this.concat().sort((a, b) => asc ? b.datePosted - a.datePosted: a.datePosted - b.datePosted);
        }

        /**
         * Take this list of transactions and group them by month.
         * @returns {Object[Date, Transactions]} An Object mapping of {`YYYY-MM`: Transactions()}
         * with the key being the year and month and the value being a transaction collection
         * with subsequent matching year and month.
         * @returns {TransactionGroup} A new grouping of Transactions we can use for munging data.
         */
        monthly() {
            switch( this.length ) {
                case 0:
                    return new TransactionGroup();
                case 1:
                    return new TransactionGroup(this);
                default:
                    return this.sorted().reduce((monthGroups, txn) => monthGroups.append(txn), new TransactionGroup());
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
         * @param {Date|String|undefined} fromDate No transactions older than this date.
         * @param {Date|String|undefined} toDate No transactions newer than this date.
         * @param {String|undefined} description Transactions matching this string.
         * @param {Number} limit Limit the number of transactions to this many.
         *  Use -1 to disable this filter.
         * @param {Array<String>|undefined} tags List of tags transaction must match.
         * @returns {Transactions} List of transactions after filtering and limiting.
         */
        getTransactions(fromDate=undefined, toDate=undefined, description=undefined, tags=undefined, limit=-1, sort=false) {
            let result = this.filter(txn => {
                let tests = {
                    date: true,
                    description: false,
                    tags: false,
                };

                /* DATES */
                if ( fromDate !== undefined && toDate !== undefined ) {
                    tests.date = this.filterDaterange(txn, fromDate, toDate);
                }

                /* DESCRIPTION */
                if ( description !== undefined ) {
                    tests.description = this.filterDescription(txn, description);
                }

                /* TAGS (OR|ANY) */
                if ( tags !== undefined && tags.length > 0 ) {
                    tests.tags = this.filterTags(txn, tags);
                }

                const useDate = ( fromDate !== undefined && toDate !== undefined ),
                  useDescription = description !== undefined,
                  useTags = tags !== undefined && tags.length > 0;

                  let truthy = [
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

            if ( sort ) {
                result = result.sorted();
            }

            if ( limit && limit > 0 ) {
                result = result.slice(0, limit);
            }

            return result;
        }

        /**
         * Give me the institution mapping and list of transactions As CSV from bank.
         * I'll return back to you a data structure you can use to $upsert the database with transactions
         * mapped to the cannonical model.
         * @param {Yaba.models.Institution} institution The mapped institution to this set of transactions.
         * @param {Yaba.models.Account.id} accountId The target accountId this CSV file has been dropped on.
         * @param {List<Yaba.models.Transaction>} transactions List of transactions/CSV rows as Object from CSV upload.
         * @returns {Array} List of transactions mapped to the canonical model.
         * @todo Reject bad data. Sure, we throw an Exception if the engineer does something wrong, but if the user
         *   drops the wrong CSV file on us, we need to filter out the txns that don't match what we expect to reduce
         *   the chances of cluttered data.
         * @todo Have the ability to accept or reject the changes as a result of dropping the CSV file on this account.
         *   Here is where we can implement some sort of "undo" function.
         */
        static digest(institution, accountId, transactions) {
            let results = new Transactions(), mappings = institution.mappings.concat();
            mappings.unshift({
                mapType: 'static',
                toField: 'accountId',
                fromField: accountId
            });
            transactions.map((transaction) => {
                var cannonical = {};
                mappings.map((mapping) => {
                    switch(mapping.mapType) {
                        case 'static':
                            cannonical[mapping.toField] = mapping.fromField;
                            break;
                        case 'dynamic':
                            if ( mapping.toField == 'amount' ) {
                                if ( cannonical.hasOwnProperty('amount') ) {
                                    cannonical[mapping.toField] += transaction[mapping.fromField];
                                } else {
                                    cannonical[mapping.toField] = transaction[mapping.fromField];
                                }
                                break;
                            }
                            cannonical[mapping.toField] = transaction[mapping.fromField];
                            break;
                        default:
                            throw new Error(`Invalid mapType(${mapping.mapType}) for institution "${institution.name}" ` +
                            `attached to account "${accountId}" on transaction "${transaction.id}".`);
                    }
                });
                results.push( cannonical );
            });
            return results.sorted();
        }

        /**
         * This is called twice in each of the account controllers to handle when a file upload is dropped.
         * Avoid copy-paste code.
         * @param {Yaba.models.Institutions} institutions Institutions Model Service.
         * @param {Yaba.models.accounts} accounts Accounts Model Service
         */
        static csvHandler($rootScope, $scope, institutions, accounts) {
            return (event, results) => {
                // Get all the transactions back and fill up the table.
                let transactions = Transactions.digest(
                    institutions.byId(results.institutionId),
                    results.accountId,
                    results.parsedCSV.data
                );
                let account = accounts.byId(results.accountId);
                account.transactions.push(...transactions);
                accounts.save($scope);
                $rootScope.$broadcast('yaba.txn-change', {update: true});
            };
        }

        /**
         * Linker function to join a transaction to the edit boxes we embed in a transaction listing.
         */
        static txnTable($rootScope, $timeout) {
            return function($scope, $element, $attr, ngModel) {
                // Store the name of the element we will use later in distinguishing events.
                const fieldName = $attr.ngModel.replace('.', '-');
                let events = {};
                $scope.edit = {};
                const clickEvent = ($event) => {
                    if ( !$element.hasClass('active-editing') ) {
                        const eventName = `yaba.edit2view-${fieldName}`;
                        /**
                         * For the onblur, onkeypress(Enter|Esc|Shift+Enter|Tab|Shift+Tab) events. This will let us
                         * leave editing context and return to view context.
                         * @param {Event} $$event JS Event object provided by AngularJS.
                         * @param {jQuery.element} input Input element that will hold the value we will extract.
                         * @param {Boolean} toSave TRUE if we should invoke the save event. FALSE if we are cancelling the edit.
                         */
                        events[eventName] = $scope.$on(eventName, ($$event, jqEvent, oldFieldValue=false) => {
                            if ( $element.hasClass('active-editing') ) {
                                $$event && $$event.preventDefault();
                                jqEvent && jqEvent.preventDefault();
                                $element.removeClass('active-editing');
                                if ( eventName in events ) {
                                    events[eventName]();
                                    delete events[eventName];
                                }

                                // If we are saving, then we are taking the value from the textbox as our input.
                                // If we are not saving, meaning we are cancelling the edit, then we revert to the
                                // ng-model="" value instead. We just use this method to ensure that it's decorated
                                // the same no matter how we return to "view-mode".
                                if ( oldFieldValue !== false ) {
                                    ngModel.$$ngModelSet($scope, oldFieldValue);
                                }
                                $scope.edit[fieldName] = false;
                                $scope.$emit('save.accounts', this);
                                $rootScope.$broadcast('yaba.txn-change');
                                if ( jqEvent.type && ['keydown'].includes(jqEvent.type) ) {
                                    try{ $scope.$apply(); } catch(e) { console.error(e); }
                                }
                            } else {
                                console.warn(`${eventName} called, but we are not actively-editing.`);
                            }
                        });

                        const attachEvents = () => {
                            const childInput = $($element).find('input');
                            // const childSpan = $($element.children()[0]); // Get the containing <span /> element.
                            // const childInput = $(childSpan.children()[0]); // Get the actual <input /> as jQuery element.
                            childInput.on('keydown', $$event => {
                                $$event.element = childInput;
                                $$event.keypress = true;
                                switch($$event.which) {
                                    case 27: // [ESC]
                                        console.info(`fire keypress(key.Esc, ${eventName})`);
                                        $scope.$emit(eventName, $$event, fieldValue)
                                        return;
                                    case 13: // [Enter]
                                        if ( !$$event.ctrlKey ) return;
                                        console.info(`fire keypress(key.Enter, ${eventName})`);
                                        $scope.$emit(eventName, $$event)
                                        return;
                                }
                            // }).on('blur', ($$event) => {
                            //     console.log(`fire blur(${eventName})`);
                            //     $scope.$emit(eventName, $$event);
                            }).focus();
                        };

                        const fieldValue = ngModel.$viewValue;
                        $event && $event.preventDefault();
                        $scope.edit[fieldName] = true;
                        $element.addClass('active-editing');

                        /**
                         * We have to call $timeout() here to ensure we've given the animations
                         * enough time to render the next components we are going to edit here.
                         */
                         $timeout(attachEvents, 10);

                        $scope.$apply();
                    } else { // if ( !$element.hasClass('active-editing') )
                        console.warn('click() called but we already hasClass(active-editing)');
                    }
                }; // clickEvent($event){}
                $scope.$parent.editable && $element.on('click', clickEvent);
            } // link($scope, $element, $attr, ngModel);
        } // static txnTable();

        static dataChart($scope, $element, $attr) {
            const budgets = () => {
                // Collect all the data points as [$date, $txnTags[0], $txnTags[1], ...];
                const dataPoints = (txn) => [ txn.datePosted ].concat($scope.txnTags.map(tag => txn.tags.includes(tag)? txn.amount: 0.0 ));
                // Iterate the full list of transactions to get the data points we need to plot.
                const dataMap = $scope.transactions.byTags($scope.txnTags).sorted().map(txn => dataPoints(txn));
                return [ ['Date'].concat($scope.txnTags) ].concat(dataMap);
            };
            $scope.$on('controls.change', () => $scope.rebalance());

            const redrawCharts = () => {
                const dataTable = new google.visualization.DataTable();
                const zeroTags = $scope.txnTags.map(x => 0.0);
                dataTable.addColumn({type: 'date', label: 'Date', pattern: 'yyyy-MM-dd'});
                $scope.txnTags.forEach(txnTag => dataTable.addColumn({ type: 'number', label: txnTag }));
                $scope.myBudgets = budgets(); // DEBUG
                if ( $scope.myBudgets.length <= 1 ) {
                    console.warn('No budgets.');
                    return;
                }
                // Insert a 0 metric for all tags to give them a starting point for the graph.
                $scope.myBudgets.splice(1, 0, [$scope.toDate].concat(zeroTags));
                // Append a 0 metric to the end as well to give the graphs something to render for the present.
                $scope.myBudgets.push([$scope.fromDate].concat(zeroTags));
                dataTable.addRows($scope.myBudgets.slice(1));
                var options = {
                    title: 'Budget Spending',
                    lineStyle: 'connected',
                    legend: { position: 'bottom' }
                };
                const chart = new google.visualization.LineChart($element[0]);
                chart.draw(dataTable, options);
            };

            if ( Yaba.gCharts ) {
                // just do/listen
                return $scope.$watchCollection('transactions', redrawCharts);
            } else {
                // wait
                return $scope.$on('google-charts-ready', () => {
                    console.info('Match google-charts-ready! Registering watcher...');
                    return $scope.$watchCollection('transactions', redrawCharts);
                });
            }
        }

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
        constructor(...args) {
            if ( args.length > 0 && typeof args[0] != 'number' ) {
                args.forEach((txns, i) => {
                    if ( false === txns instanceof Transactions && false === txns instanceof Transaction) {
                        throw new TypeError(`Argument ${i} must be Transaction() or Transactions(). Got ${txns.constructor.name}`);
                    }
                    if ( txns instanceof Transaction ) {
                        txns = new Transactions(txns);
                    }
                    this.append(...txns);
                });
            }
        }

        /**
         * Append another transaction to the list but categorize accordingly upon assignment.
         * @param  {...any} txns Transactions to attempt to append to this object.
         * @returns {TransactionGroup} This object for chaining.
         */
        append(...txns) {
            for ( let txn of txns ) {
                if ( false === txn instanceof Transaction ) {
                    console.error(txns);
                    throw new TypeError(`txn must be Transaction(), got ${txn.constructor.name}`);
                }
                let yyyymm = txn.YYYYMM();
                if ( ! this.hasOwnProperty(yyyymm) ) {
                    this[yyyymm] = new Transactions();
                }
                this[yyyymm].push(txn);
            }
            return this;
        }

        /**
         * Get me a list of these transactions with 0 collections where there are no transactions.
         * e.g. `{2022-06: ..., 2022-08: ..., 2022-09: ...}`
         * will make: `{2022-06: ..., 2022-07: new Transactions(0), 2022-08: ..., 2022-09: ...}`
         * So we don't end up with skipping a month. Prepares us for Grid operations.
         * @param {Object<Date: Transactions>} txnGroups Result from `Transactions().monthly()`
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
                if ( !this.hasOwnProperty( startDate.toISOShortDate().split('-', 2).join('-') ) ) {
                    console.log(`Missing ${startDate.toISOShortDate()}, adding a 0...`);
                    this.append(new Transaction({
                        datePosted: startDate.round(),
                        amount: 0.0,
                        description: 'TransactionGroup auto-record. Normalized 0-amount entry.',
                        merchant: this.constructor.name,
                        tags: ['hidden']
                    }));
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
        subtract(that) {
            let result = new TransactionGroup();
            // console.log('(this != that).oldest(): ', {income: this.oldest().toISOShortDate(), expense: that.oldest().toISOShortDate()});
            if ( this.oldest().toISOShortDate() != that.oldest().toISOShortDate() ) {
                if ( this.oldest() < that.oldest() ) {
                    that.append(new Transaction({
                        datePosted: this.oldest(),
                        amount: 0.0,
                        description: 'TransactionGroup auto-record. txnGroup.oldest() was newer than ${this}.',
                        merchant: this.constructor.name,
                        tags: ['hidden']
                    }));
                }
                if ( that.oldest() < this.oldest() ) {
                    this.append(new Transaction({
                        datePosted: that.oldest(),
                        amount: 0.0,
                        description: 'TransactionGroup auto-record. txnGroup.oldest() was newer than ${this}.',
                        merchant: that.constructor.name,
                        tags: ['hidden']
                    }));
                }
            }
            // console.log('(this != that).newest(): ', {income: this.newest().toISOShortDate(), expense: that.newest().toISOShortDate()});
            if ( this.newest().toISOShortDate() != that.newest().toISOShortDate() ) {
                if ( this.newest() < that.newest() ) {
                    that.append(new Transaction({
                        datePosted: this.newest(),
                        amount: 0.0,
                        description: 'TransactionGroup auto-record. txnGroup.newest() was newer than ${this}.',
                        merchant: this.constructor.name,
                        tags: ['hidden']
                    }));
                }
                if ( that.newest() < this.newest() ) {
                    this.append(new Transaction({
                        datePosted: that.newest(),
                        amount: 0.0,
                        description: 'TransactionGroup auto-record. txnGroup.newest() was newer than ${this}.',
                        merchant: that.constructor.name,
                        tags: ['hidden']
                    }));
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
                let [ iDate, income ] = incomes.shift(), [eDate, expense] = expenses.shift();
                if ( iDate != eDate ) { console.warn("Dates don't match?!", iDate, eDate); }
                let amount = Math.abs(expense.sum()) - Math.abs(income.sum());
                let txn = new Transaction({
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

        length() {
            return Object.keys(this).length;
        }

        /**
         * Pythonic way of getting dict.items(). Sorting by date instead of strings seems to be more reliable.
         * @returns {Array} The list of this set of items.
         */
        items() {
            return Object.entries(this).concat().sort((a, b) => new Date(b[0] + '-01') - new Date(a[0] + '-01'));
        }

        /**
         * Map over each of the collections of transactions we have.
         * @param {Function} callbackFn Callback Function to iterate over.
         * @returns Make [].map() available to `this`.
         */
        map(callbackFn) {
            const overrideCallbackFn = (value, index, arr) => {
                let [ date, txns ] = value;
                return callbackFn(date, txns, index, arr);
            }
            return this.items().map(overrideCallbackFn, this);
        }

        /**
         * Get the oldest transaction of this group collection.
         * @returns {Date} The date of the oldest transaction of this collection, `round()`ed.
         */
        oldest() {
            try {
                return this.items().pop().pop().sorted().pop().datePosted.round();
            } catch (e) {
                console.error(`Failed getting oldest(): ${e}`);
                return Yaba.models.DATENULL;
            }
        }

        /**
         * Get the latest or most recent transaction of this group collection.
         * @returns {Date} The date of the newest/latest transaction of this collection, round()ed.
         */
        newest() {
            try {
                return this.items().shift().pop().sorted().shift().datePosted.round();
            } catch (e) {
                console.error(`Failed getting newest(): ${e}`);
                return Yaba.models.DATENULL;
            }
        }

        /**
         * Give me a full sum of all the transactions in this collection of collections.
         * @returns {Number}
         */
        sum() {
            return this.sums().reduce((a, b) => a + Object.values(b).shift(), 0);
        }

        /**
         * Returns a list of sum() values from each of this collection of collections of transactions.
         * READ: Monthly summaries!
         * @returns {Array<Number>} List of numbers for the set of monthly summaries.
         */
        sums() {
            const objDescriptor = txns => ({enumerable: true, writeable: true, value: txns.sum()});
            return this.map((date, txns) => Object.defineProperty({}, date, objDescriptor(txns) ));
        }

        /**
         * Give me a full sum of all the transactions in this collection of collections.
         * @returns {Number}
         */
        average() {
            return this.averages().reduce((a, b) => a + Object.values(b).shift(), 0) / this.length();
        }

        /**
         * Provides a list of averages across all the transactions in this collection.
         * HINT: This is local averaging.
         */
        averages() {
            const objDescriptor = txns => ({enumerable: true, writeable: true, value: txns.avg()});
            return this.map((date, txns) => Object.defineProperty({}, date, objDescriptor(txns) ));
        }

        /**
         * This is where the magic happens. We PROJECT ourselves into the future and assume that our current
         * trajectory will remain the same for the forecasted future. As we iterate over the future,
         * we include the purchases we want to make in order to see how it will impact our paycheque.
         * Here, we count into the future until we want to see and include those transactions in our calculations.
         * Provide me with a matrix of what comes back.
         * @returns {TransactionGroup} New instance of this class for Projecting calculations/views.
         */
        project(wishlist) {
            if ( wishlist instanceof Transactions ) {
                wishlist = new TransactionGroup(...wishlist);
            }
            let result = new TransactionGroup();
            let avgBalance = this.average();
            let startDate = this.newest();
            let endDate = new Date(startDate * 1 + Settings.TransactionDeltas.days365);
            console.log('wishlist', wishlist);
            console.log('start/end', startDate.toISOShortDate(), endDate.toISOShortDate());

            while ( startDate < endDate ) {
                let txn = new Transaction({
                    datePosted: startDate,
                    amount: avgBalance,
                    merchant: this.constructor.name,
                    tags: ['auto', 'future']
                });
                if ( wishlist.hasOwnProperty(txn.YYYYMM()) ) {
                    result.append(...wishlist[txn.YYYYMM()]);
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
    class Prospects extends Transactions {};

    /**
     * @property {string} TransactionFields
     * Constant. List of top-level member fields that represent a transaction.
     */
    const TransactionFields = Object.freeze( Object.keys( new Transaction() ).filter(x => x[0] != '_') );

    Yaba.hasOwnProperty('models') || (Yaba.models = {});
    Yaba.models.NULLDATE            = NULLDATE;
    Yaba.models.TransactionFields   = TransactionFields;
    Yaba.models.Institution         = Institution;
    Yaba.models.Account             = Account;
    Yaba.models.Transaction         = Transaction;
    Yaba.models.Settings            = Settings;
    Yaba.models.Institutions        = Institutions;
    Yaba.models.Accounts            = Accounts;
    Yaba.models.Transactions        = Transactions;
    Yaba.models.TransactionGroup    = TransactionGroup;
    Yaba.models.Prospects           = Prospects;

    return Yaba;
})(Yaba);
