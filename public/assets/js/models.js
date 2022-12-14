/**
 * Models around Yaba controllers. Tie HTTP calls and data together.
 */
(function(Yaba) {
    'use strict';

    const NULLDATE = new Date('1970-01-01T00:00:');

    class Institution {
        constructor(data={}) {
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
            }))
        }

        toString() {
            return JSON.stringify(this);
        }
    }

    class Account {
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

        toString() {
            return JSON.stringify(this);
        }
    }

    class Transaction {
        static Types = {
            Credit: 'credit',
            Debit: 'debit',
            Transfer: 'transfer',
            Payment: 'payment',
        }

        constructor(data={}) {
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

        toString() {
            return JSON.stringify(this);
        }
    }

    class Institutions {
        /**
         * @property {angular.ChildScope}
         */
        $scope;

        constructor(services) {
            this.$http = services.$http;
            this.$scope = services.$scope;
        }

        /**
         * Query for an institution, many institutions and get more details in list format.
         * @returns Object<Institution>
         */
        load() {
            var result = this.$http({
                method: 'QUERY',
                url: '/api/institutions',
                data: {}
            });
            result.then((response) => { return this.loaded(response); }, Yaba.utils.reject);
            return result;
        }

        loaded(response) {
            var result = [];
            response.data.institutions.forEach((_institution) => {
                var institution = new Yaba.models.Institution(_institution);
                result.push(institution);
            });
            return this.$scope.institutions = result;
        }

        /**
         * Save an institution to the server.
         * @param {Interface Institution} institution The Institution we are saving to the server.
         * @returns HTTPResponse.
         */
        save() {
            var params = {
                institution: new Yaba.models.Institution(this.$scope.institution)
            };
            var result = this.$http({
                method: 'POST',
                url: '/api/institution',
                data: params
            });
            result.then((response) =>{ this.saved(response); }, Yaba.utils.reject);
            this.$scope.$parent.institutions.push(params.institution);
            return result;
        }

        /**
         * Hook to execute after we've gotten a successful message from the server.
         * @param {XmlHttpResponse} response HTTP response object from the server.
         * ${this} context is Institution class object.
         */
        saved(response) {
            if (response.status == 200) {
                this.$scope.$parent.seeForm = false;
            }
            this.$scope.close();
            // @TODO: Make some notification popup saying it was saved OK.
        }
    }

    class Accounts {
        constructor(services) {
            services.hasOwnProperty('$http') && ( this.$http = services.$http );
            services.hasOwnProperty('$scope') && ( this.$scope = services.$scope );
        }

        /**
         * Load accounts to be loaded to the form.
         * @returns Object<Institution>
         */
        load(options={}) {
            var query = {};
            if ( options.accountId ) {
                query.accountId = options.accountId;
            }
            if ( options.institutionId ) {
                query.institutionId = options.institutionId;
            }
            var result = this.$http({
                method: 'QUERY',
                url: '/api/accounts',
                data: query
            });

            result.then((response) => { return this.loaded(response); }, Yaba.utils.reject);
            return result;
        }

        loaded(response) {
            this.$scope.accounts = [];
            response.data.accounts.forEach( (account) => {
                this.$scope.accounts.push(new Yaba.models.Account(account));
            });
            return this.$scope.accounts;
        }

        /**
         * Save an account to the server based on what is in the local scope.
         * @returns null
         */
        save() {
            var options = {
                account: new Yaba.models.Account(this.$scope.account)
            };
            console.log('sending account to server:');
            console.log(options);
            var result = this.$http({
                method: 'POST',
                url: '/api/account',
                data: options
            });
            result.then((response) => { return this.saved(response); }, Yaba.utils.reject);
            return result;
        }

        saved(response) {
            console.log(`saved: ${response.status}`);
            if (response.status == 200) {
                this.$scope.$parent.seeForm = false;
            }
            this.$scope.close();
            // @TODO: Make some notification popup saying it was saved OK.
        }
    }

    class Transactions {
        constructor(services) {
            this.$http = services.$http;
            this.$scope = services.$scope;
        }

        load(query={}) {
            var options = {
                accountId: query.accountId,
            };
            // query.fromDate && (options.fromDate = query.fromDate);
            // query.toDate && (options.toDate = query.toDate);
            // query.tags && (options.tags = query.tags);
            var result = this.$http({
                method: 'QUERY',
                url: '/api/transactions',
                data: options
            });
            result.then(response => { return this.loaded(response); }, Yaba.utils.reject);
            return result;
        }

        loaded(response) {
            this.$scope.transactions = [];
            response.data.transactions.forEach((txn) => {
                var transaction = new Yaba.models.Transaction(txn);
                this.$scope.transactions.push(transaction);
            });
        }

        save() {
            var options = { transaction: new Yaba.models.Transaction(this.$scope.transaction) };
            var result = this.$http({
                method: 'POST',
                url: '/api/transaction',
                data: options
            });
            result.then((response) => { return this.saved(response); }, Yaba.utils.reject);
            return result;
        }

        saved(response) {
            if (response.status == 200) {
                this.$scope.$parent.seeForm = false;
            }
            this.$scope.close();
            // @TODO: Make some notification popup saying it was saved OK.
        }
    }

    Yaba.hasOwnProperty('models') || (Yaba.models = {
        Institution,
        Account,
        Transaction,
        Accounts,
        Institutions,
        Transactions,
    });

    return Yaba;
})(Yaba);

(function(Yaba){
    //@TODO: Find a way to derive this from the server.
    const TransactionFields = Object.freeze( Object.keys( new Yaba.models.Transaction() ) );

    /* Forms as angular.directive() */
    class InstitutionFormCtrl {
        constructor($scope, $http) {
            this.$scope = $scope;
            this.$http = $scope.$http = $http;
            this.$scope.close = this.close;
            $scope.addMapping = this.addMapping;
            $scope.remove = this.remove;
            $scope.reset = this.reset;

            this.institution = new Yaba.models.Institutions({ $scope: $scope, $http: $http });
            $scope.transactionFields = TransactionFields;
            this.$scope.save = (e) => {
                this.institution.save();
            };
        }

        remove($index) {
            this.institution.mappings.splice($index, 1);
        }

        close() {
            this.$parent.seeForm = false;
            this.reset();
        }

        reset() {
            this.institution.name = '';
            this.institution.description = '';
            this.institution.mappings = [
                {
                    fromField: '',
                    toField: '',
                    mapType: '',
                }
            ];
        }

        addMapping() {
            this.institution.mappings.push({
                fromField: '',
                toField: '',
                mapType: '',
            });
        };

    }
    InstitutionFormCtrl.$inject = ['$scope', '$http'];
    Yaba.app.directive('yabaInstitutionForm', () => {
        return {
            templateUrl: '/assets/views/forms/institution.htm',
            controller: InstitutionFormCtrl,
            scope: {
                institution: '='
            },
            restrict: 'E'
        };
    });

    class AccountFormCtrl {
        constructor($scope, $http, $animate) {
            var self = this;
            this.$scope = $scope;
            this.$http = $scope.$http = $http;
            this.$animate = $animate;
            this.$scope.close = this.close;
            this.accounts = new Yaba.models.Accounts({ $scope: $scope, $http: $http });
            this.$scope.save = () => {
                return this.accounts.save();
            };
        }

        close() {
            // this.$animate.removeClass($('#new-account'), 'ng-show');
            this.$parent.seeForm = false;
        }
    }
    AccountFormCtrl.$inject = ['$scope', '$http', '$animate'];
    Yaba.app.directive('yabaAccountForm', (() => {
        return {
            templateUrl: '/assets/views/forms/account.htm',
            controller: AccountFormCtrl,
            scope: {
                account: '=',
            },
            restrict: 'E'
        };
    }));

    class BudgetCtrl {
        constructor($scope, $http) {
            // ${this} context here is $scope when functions are assigned like this in the constructor.
            this.$scope = $scope;
            this.$http = $scope.$http = $http;
            $scope.uniques = this.uniques;
            $scope.budgets = this.budgets;
        }

        uniques() {
            var seen = [];
            this.transactions.forEach((transaction) => {
                transaction.tags.forEach((tag) => {
                    if ( seen.includes(tag) ) return;
                    seen.push(tag);
                });
            });
            return seen;
        }

        budgets() {
            var results = {};
            this.transactions.forEach((transaction) => {
                transaction.tags.forEach((tag) => {
                    if ( results.hasOwnProperty(tag) ) {
                        results[tag] += transaction.amount;
                    } else {
                        results[tag] = transaction.amount;
                    }
                });
            });
            return results;
        }

    }
    BudgetCtrl.$inject = ['$scope', '$http'];
    Yaba.app.directive('yabaBudget', () => {
        return {
            templateUrl: '/assets/views/tables/budget.htm',
            controller: BudgetCtrl,
            restrict: 'AE'
        };
    });

    class TransactionListCtrl {
        /**
         * Renders a collection of transactions. Controller for handling the list of transactions
         * and however we may want to render them.
         */
        constructor($scope, $attrs) {
            // By default, don't show tags. We can override this in the HTML include for this widget.
            $scope.includeTags = $attrs.hasOwnProperty('includeTags');
            $scope.withHeader = !$attrs.hasOwnProperty('withoutHeader');
            $scope.limit = $attrs.limit || -1;
            $scope.sortColumn = 'datePosted';
            $scope.sortBy = this.sortBy;
            $scope.save = this.save;
            this.$scope = $scope;
        }

        sortBy(field) {
            this.sortColumn = field;
        }

        save() {
            // var txn = {
            //     datePosted: this.datePosted,
            //     datePending: this.datePending,
            //     amount: this.amount,
            // }
            console.log('save-transaction()');
            console.log(this);
        }
    }
    TransactionListCtrl.$inject = ['$scope', '$attrs'];
    Yaba.app.directive('yabaTransactionList', () => {
        return {
            templateUrl: '/assets/views/tables/transactions.htm',
            controller: TransactionListCtrl,
            scope: {
                'transactions': '='
            },
            restrict: 'E'
        };
    });

    function wishlist($scope, $element, $attr) {
        $scope.wishlist = $scope.wishlist || [];
        $scope.sortColumn = 'datePosted';

        $scope.add = function add() {
            this.wishlist.push({
                amount: this.amount,
                datePurchase: this.datePurchase,
                description: this.description
            });
        };

        $scope.sortBy = function sortBy(field) {
            this.sortColumn = field;
        };
    }
    Yaba.app.directive('yabaWishlist', () => {
        return {
            templateUrl: '/assets/views/prospect/wishlist.htm',
            link: wishlist,
            scope: {
                wishlist: '='
            },
            restrict: 'E'
        };
    });


    /**
     * Give me the institution mapping and list of transactions As CSV from bank.
     * I'll return back to you a data structure you can use to $upsert the database with transactions
     * mapped to the cannonical model.
     * @param {Yaba.models.Institution} institution The mapped institution to this set of transactions.
     * @param {Yaba.models.Account} account The target account this CSV file has been dropped on.
     * @param {List<Yaba.models.Transaction>} transactions List of transactions/CSV rows as Object from CSV upload.
     */
    function mapInstitution(institution, account, transactions) {
        var results = [];
        institution.mappings.unshift({
            mapType: 'static',
            toField: 'accountId',
            fromField: account.id
        });
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
                        throw new Exception(`Invalid mapType for institution ${institution.name} attached to account ${account.id} on transaction ${transaction.id}.`);
                }
            });
            results.push( cannonical );
        });
        return results;
    }

    /**
     * Enables one to include class="dropable" as an attribute and it'll attach this event that will
     * handle dragging a file into the element.
     */
    function filedrop($scope, $element, $attr) {
        function highlight(event) {
            if ( event ) {
                event.preventDefault();
            }
            $element.addClass('dragging');
            return false;
        }

        function unlight(event) {
            if ( event ) {
                event.preventDefault();
            }
            $element.removeClass('dragging');
            return false;
        }

        function parseError(err, file, element, reason) {
            console.log(`Papa.parse() error from ${file} in ${element}: ${err}`);
            console.log(reason);
        }

        function done(results) {
            if ( $attr.headers ) {
                // only get back the headers from the CSV file.
                var headers = Object.keys(results.data.shift());
                $scope.institution.mappings = [];
                headers.forEach((h) => {
                    $scope.institution.mappings.push({
                        fromField: h,
                        toField: '',
                        mapType: 'dynamic'
                    });
                })
            } else {
                // Get all the transactions back and fill up the table.
                const account = $scope.account;
                const institution = $scope.institutions.filter(i => i.id == account.institutionId).shift();
                var transactions = mapInstitution(institution, account, results.data);
                transactions.forEach((txn) => {
                    $scope.account.transactions.unshift(new Yaba.models.Transaction(txn));
                });
            }
            $scope.$apply();
        }

        function drop(event) {
            if ( event ) { event.preventDefault(); }
            unlight(event);
            angular.forEach(event.originalEvent.dataTransfer.files, (uploadFile) => {
                Papa.parse(uploadFile, {
                    header: true,
                    skipEmptyLines: true,
                    error: parseError,
                    complete: done
                });
            });
        }

        $element.bind('dragover', highlight);
        $element.bind('dragenter', highlight);
        $element.bind('dragleave', unlight);
        $element.bind('dragend', unlight);
        $element.bind('drop', drop);
    }
    Yaba.app.directive('dropable', () => {
        return {
            link: filedrop,
            restrict: 'AC'
        }
    })

    Yaba.app.directive('yabaDaterange', () => {
        return {
            templateUrl: '/assets/views/daterange.htm',
            restrict: 'E'
        }
    });

})(Yaba);

(function(Yaba) {
    'use strict';

    /* angular.filter() */
    function budgetBy() {
        return (transactions, filterTags) => {
            if ( !transactions ) return transactions;
            if ( !filterTags ) return transactions;
            var result = [];
            transactions.forEach((transaction) => {
                if ( typeof filterTags == 'string' ) {
                    filterTags = filterTags.split(',');
                }
                filterTags.forEach((incomeTag) => {
                    if ( transaction.tags.includes(incomeTag.trim()) ) {
                        result.push(transaction);
                    }
                });
            })
            return result;
        };
    }

    Yaba.hasOwnProperty('filters') || (Yaba.filters = {
        budgetBy: budgetBy(),
    });

    Yaba.app.filter('budgetBy', budgetBy);
    return Yaba;
})(Yaba);
