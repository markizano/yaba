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
            super(`Institution Mapping should contain one of` +
              ` "${Yaba.models.TransactionFields.join(", ")}". ` +
              `Got ${toField} when setting ${fromField}`);
            this.name = this.constructor.name;
        }
    }

    /**
     * Base object that will enable us to store and load our informations.
     */
    class Storable {
        save($scope) {
            let event = `save.${this.constructor.name}()`;
            console.log('JSONable.save()', event);
            return $scope.$emit(event, this);
        }

        load($scope) {
            var data = JSON.parse( localStorage.getItem(this.constructor.name.toLowerCase()) || '[]' );
            return $scope[this.constructor.name.toLowerCase()] = new this(data);
        }
    }

    class Storables extends Array {

        clear() {
            this.length = 0;
        }

        store() {

              localStorage.setItem(this.constructor.name.toLowerCase(), this.toString());
        }
    }
    Storables.prototype.save = Storable.prototype.save;
    Storables.prototype.load = Storable.prototype.load;

    
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

        save($scope) {
            $scope.$emit('save.accounts', this);
            return this;
        }

        store() {
            console.log(`Saving ${this.constructor.name}...`);
            localStorage.setItem( this.constructor.name.toLowerCase(), this.toString() );
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
            this.mappings = [];
            data.mappings && (data.mappings.forEach(mapping => {
                if ( !Yaba.models.TransactionFields.includes(mapping.toField) ) {
                    throw new InstitutionMappingException(mapping.fromField, mapping.toField);
                }
                this.mappings.push({
                    fromField: mapping.fromField || '',
                    toField: mapping.toField || '',
                    mapType: mapping.mapType || null
                });
            })) || (this.mappings.push({
                fromField: '',
                toField: '',
                mapType: null,
                _visible: false
            }));
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
            if ( data.mappings ) {
                this.mappings = [];
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
            }
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
            this.balance = data.balance || 0.0;
            this.accountType = data.accountType || null;
            this.number = data.number || '';
            this.routing = data.routing || '';
            this.interestRate = Number(data.interestRate) || 0.0;
            this.interestStrategy = data.interestStrategy || null;
            this.transactions = new Transactions();
            this.transactions.push(...data.transactions || []);
        }

        /**
         * Typecast the data we get from outside of this object.
         * @param {Object} data Inputs to scrub.
         * @returns scrubbed results
         */
        typecast(data) {
            if ( data.balance && ! typeof data.balance == 'number' ) {
                data.balance = Math.parseCurrency(data.balance);
            }
            if ( data.institutionId && data.institutionId instanceof Institution ) {
                data.institutionId = data.institutionId.id;
            }
            if ( data.interestRate && ! typeof data.interestRate == 'number' ) {
                data.interestRate = Number(data.interestRate);
            }
            if ( data.transactions
              && ! data.transactions instanceof Transactions ) {
                let txns = data.transactions;
                data.transactions = new Transactions();
                data.transactions.push(...txns);
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
            data.balance            && (this.balance = data.balance);
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
                        mapType: 'dynamic',
                        _visible: false
                    });
                    // Set a timeout to alter the visibility immediately after the element has been
                    // rendered on the page to enable the animation.
                    $timeout(() => {
                        $scope.institution.mappings[i]._visible = true;
                    }, 100);
                });
                // Let AngularJS know about this since the papaparser breaks the promise chain.
                $scope.$apply();
            };
        }
    }

    class Accounts extends JSONables {

        push(...items) {
            for ( let i in items ) {
                let item = items[i];
                item instanceof Account || (items[i] = new Account(item));
            }
            return super.push(...items);
        }

        unshift(...items) {
            for (let i in items) {
                let item = items[i];
                item instanceof Account || (items[i] = new Account(item));
            }
            return super.unshift(...items);
        }

        selected(selectedAccounts) {
            return this.filter(a => {
                return selectedAccounts.includes(a);
            });
        }

    }

    class Transactions extends JSONables {

        push(...items) {
            for ( let i in items ) {
                let item = items[i];
                item instanceof Transaction || (items[i] = new Transaction(item));
            }
            return super.push(...items);
        }

        unshift(...items) {
            for (let i in items) {
                let item = items[i];
                item instanceof Transaction || (items[i] = new Transaction(item));
            }
            return super.unshift(...items);
        }

        /**
         * Filters out transactions by date. Gives a Transaction collection
         * within a time range between two dates.
         * @param {Date} fromDate No transactions older than this date.
         * @param {Date} toDate No transactions newer than this date.
         * @returns {Transactions}
         */
        daterange(fromDate, toDate) {
            return this.filter((txn) => {

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
            });
        }

        /**
         * In the case that we have multiple accounts transactions in this collection,
         * this allows us to filter them out so we only have transactions of a specific
         * accountId.
         * @param {uuid.v4} accountId The account ID to filter.
         * @returns {Transactions} List of transactions only by accountId
         */
        byAccountId(accountId) {
            return this.filter((txn) => txn.accountId == accountId);
        }

        /**
         * In the case that we have multiple accounts transactions in this collection,
         * this allows us to filter them out so we only have transactions of a specific
         * accountId.
         * @param {uuid.v4} accountId The account ID to filter.
         * @returns {Transactions} List of transactions only by accountId
         */
        byAccountIds(accountIds) {
            return this.filter((txn) => accountIds.includes(txn.accountId));
        }

        /**
         * Filter the list of transactions by tag.
         * @param {String} tag Filter the list of transactions by tag.
         * @returns {Transactions}
         */
        byTag(tag) {
            return this.filter(txn => txn.tags.includes(tag));
        }

        /**
         * Filter the list of transactions by a collection of matching tags.
         * @param {Array} tags Filter the list of transactions by a set of tags.
         * @returns {Transactions}
         */
        byTags(tags) {
            return this.filter(txn => tags.some(tag => txn.tags.includes(tag)));
        }

        /**
         * Give me the institution mapping and list of transactions As CSV from bank.
         * I'll return back to you a data structure you can use to $upsert the database with transactions
         * mapped to the cannonical model.
         * @param {Yaba.models.Institution} institution The mapped institution to this set of transactions.
         * @param {Yaba.models.Account.id} accountId The target accountId this CSV file has been dropped on.
         * @param {List<Yaba.models.Transaction>} transactions List of transactions/CSV rows as Object from CSV upload.
         * @returns {Array} List of transactions mapped to the canonical model.
         */
        static digest(institution, accountId, transactions) {
            console.log('mapInstitution()', institution);
            var results = [];
            if ( institution.mappings.filter(i => i.toField == 'accountId').length == 0 ) {
                institution.mappings.unshift({
                    mapType: 'static',
                    toField: 'accountId',
                    fromField: accountId
                });
            }
            transactions.map((transaction) => {
                var cannonical = {};
                institution.mappings.map((mapping) => {
                    switch(mapping.mapType) {
                        case 'static':
                            cannonical[mapping.toField] = mapping.fromField;
                            break;
                        case 'dynamic':
                            cannonical[mapping.toField] = transaction[mapping.fromField];
                            break;
                        default:
                            throw new Error(`Invalid mapType(${mapping.mapType}) for institution "${institution.name}" ` +
                            `attached to account "${accountId}" on transaction "${transaction.id}".`);
                    }
                });
                results.push( cannonical );
            });
            return results;
        }

        /**
         * This is called twice in each of the account controllers to handle when a file upload is dropped.
         * Avoid copy-paste code.
         * @param {Yaba.models.Institutions} institutions Institutions Model Service.
         * @param {Yaba.models.accounts} accounts Accounts Model Service
         */
        static csvHandler($scope, institutions, accounts) {
            return (event, results) => {
                // Get all the transactions back and fill up the table.
                console.log(results);
                let transactions = Transactions.digest(
                    institutions.byId(results.institutionId),
                    results.accountId,
                    results.parsedCSV.data);
                let account = accounts.byId(results.accountId);
                transactions.forEach((txn) => {
                    account.transactions.unshift(new Transaction(txn));
                });
                $scope.$apply();
                accounts.save($scope);
            };
        }

        /**
         * Linker function to join a transaction to the edit boxes we embed in a transaction listing.
         */
        static txnTable($timeout) {
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
                        events[eventName] = $scope.$on(eventName, ($$event, oldFieldValue=false) => {
                            if ( $element.hasClass('active-editing') ) {
                                $$event && $$event.preventDefault();
                                $scope.edit[fieldName] = false;
                                $element.removeClass('active-editing');
                                if ( events.includes(eventName) ) {
                                    events[eventName]();
                                    delete events[eventName];
                                }

                                // If we are saving, then we are taking the value from the textbox as our input.
                                // If we are not saving, meaning we are cancelling the edit, then we revert to the
                                // ng-model="" value instead. We just use this method to ensure that it's decorated
                                // the same no matter how we return to "view-mode".
                                if ( oldFieldValue !== false ) {
                                    console.log('cancel: ', oldFieldValue);
                                    ngModel.$viewValue = oldFieldValue;
                                }
                                // $scope.$emit('save.accounts', this);
                                // $scope.$off(eventName);
                            } else {
                                console.warn(`${eventName} called, but we are not actively-editing.`);
                            }
                        });

                        const attachEvents = () => {
                            console.log('delay: ', $element.children());
                            const childSpan = $($element.children()[0]); // Get the containing <span /> element.
                            const childInput = $(childSpan.children()[0]); // Get the actual <input /> as jQuery element.
                            childInput.on('keydown', $$event => {
                                switch($$event.which) {
                                    case 27: // [ESC]
                                        console.log(`fire keypress(key.Esc, ${eventName})`);
                                        $scope.$emit(eventName, $$event, fieldValue)
                                        break;
                                    case 13: // [Enter]
                                        console.log(`fire keypress(key.Enter, ${eventName})`);
                                        $scope.$emit(eventName, $$event)
                                        break;
                                }
                            }).focus();
                        };

                        const fieldValue = ngModel.$viewValue;
                        $event && $event.preventDefault();
                        $scope.edit[fieldName] = true;
                        $element.addClass('active-editing');
                        $scope.edit2view = ($$event) => {
                            console.log('edit2view()', $$event);
                        }

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
            const that = this;
            this.getChart = () => {
                if ( !this._chart ) {
                    this._chart = new google.visualization.LineChart($element[0]);
                }
                return this._chart;
            };

            google.charts.load(
                'current',
                {
                    'packages': ['corechart'],
                    callback: () => {
                        $scope.$watchCollection('transactions', () => {
                            const dataTable = new google.visualization.DataTable();
                            dataTable.addColumn({type: 'date', label: 'Date', pattern: 'yyyy-MM-dd'});
                            $scope.txnTags.forEach(txnTag => dataTable.addColumn({ type: 'number', label: txnTag }));
                            $scope.myBudgets = $scope.budgets(); // DEBUGGING
                            console.log($scope.myBudgets);
                            dataTable.addRows($scope.myBudgets.slice(1));
                            console.log(dataTable);
                            var options = {
                                title: 'Budget Spending',
                                legend: { position: 'bottom' }
                            };
                            const chart = that.getChart();
                            chart.draw(dataTable, options);
                        });
                    }
                }
            );
        }

    } // class Transactions() {}

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
    Yaba.models.Institutions        = Institutions;
    Yaba.models.Accounts            = Accounts;
    Yaba.models.Transactions        = Transactions;

    return Yaba;
})(Yaba);
