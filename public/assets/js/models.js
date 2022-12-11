/**
 * Models around Yaba controllers. Tie HTTP calls and data together.
 */
(function(Yaba) {
    'use strict';

    const AccountTypes = [
        'checking',
        'savings',
        'broker',
        'credit',
        'loan',
        'crypto'
    ];

    const EMPTY_Account = {
        id: '',
        name: '',
        description: '',
        accountType: AccountTypes,
        number: 0,
        routing: 0,
        interestRate: 0.0,
        interestStrategy: ['simple', 'compound']
    }

    const EMPTY_Institution = {
        id: '',
        name: '', // string
        description: '', // string
        mappings: [
            {
                fromField: '', // string
                toField: '', // string
                mapType: '' // {enum(string)}, one of ['dynamic', 'static'].
            }
        ]
    }

    class Institutions {
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
                method: 'GET',
                url: '/api/institutions',
                data: {}
            });
            result.then((response) => { return this.loaded(response); }, Yaba.utils.reject);
            return result;
        }

        loaded(response) {
            var result = [];
            response.data.institutions.forEach((institution) => {
                var mappings = [];
                institution.mappings.forEach((mapping) => {
                    mappings.push({
                        fromField: mapping.fromField,
                        toField: mapping.toField,
                        mapType: mapping.mapType
                    });
                });
                result.push({
                    name: institution.name,
                    description: institution.description,
                    mappings: mappings
                });
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
                institution: {
                    name: this.$scope.institution.name,
                    description: this.$scope.institution.description,
                    mappings: []
                }
            };
            this.$scope.institution.mappings.forEach( (mapping) => {
                params.institution.mappings.push({
                    fromField: mapping.fromField,
                    toField: mapping.toField,
                    mapType: mapping.mapType
                })
            });
            console.log('Sending to server:');
            console.log(params);
            var result = this.$http({
                method: 'POST',
                url: '/api/institution',
                data: params
            });
            result.then((response) =>{ this.saved(response); }, Yaba.utils.reject);
            console.log('call Institution.save()');
            return result;
        }

        /**
         * Hook to execute after we've gotten a successful message from the server.
         * @param {XmlHttpResponse} response HTTP response object from the server.
         * ${this} context is Institution class object.
         */
        saved(response) {
            console.log(`institution saved: ${response.status}`);
            if (response.status == 200) {
                this.$scope.$parent.seeForm = false;
            }
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
                method: 'GET',
                url: '/api/accounts',
                data: query
            });

            result.then((response) => { return this.loaded(response); }, Yaba.utils.reject);
            return result;
        }

        loaded(response) {
            this.$scope.accounts = [];
            response.data.accounts.forEach( (account) => {
                this.$scope.accounts.push(account);
            });
        }

        /**
         * Save an account to the server based on what is in the local scope.
         * @returns null
         */
        save() {
            console.log(this);
            var options = {
                account: {
                    name: this.$scope.account.name,
                    description: this.$scope.account.description,
                    number: this.$scope.account.number,
                    routing: this.$scope.account.routing,
                    institutionId: this.$scope.account.institutionId,
                    interestRate: this.$scope.account.interestRate,
                    interestStrategy: this.$scope.account.interestStrategy
                }
            };
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
            // @TODO: Make some notification popup saying it was saved OK.
        }
    }

    class Transactions {
        constructor(services) {
            this.$http = services.$http;
            this.$scope = services.$scope;
        }

        load(query={}) {
            var self = this;
            var options = {
                accountId: query.accountId,
                fromDate: query.fromDate || '-30 days',
                toDate: query.toDate || 'today',
                tags: query.tags || []
            };
            function gotTransactions(response) {
                self.$scope.hasOwnProperty('transactions') || (self.$scope.transactions = []);
                response.data.transactions.forEach(txn => {
                    self.$scope.transactions.push(txn);
                })
            }
            var result = this.$http({
                method: 'GET',
                url: '/api/transactions',
                data: options
            });
            result.then(gotTransactions, Yaba.utils.reject);
            return result;
        }

        save() {
            var transaction = {
                id: this.$scope.id,
                name: this.$scope.name,
                description: this.$scope.description,
                datePending: this.$scope.datePending,
                datePosted: this.$scope.datePosted,
                amount: this.$scope.amount,
                accountId: this.$scope.accountId,
                balance: this.$scope.balance,
                tags: ( (tags) => {
                    var result = [];
                    tags.forEach(tag => {
                        result.push(tag);
                    })
                    return result;
                })( this.$scope.tags.split(',') )
            };
            var result = this.$http({
                method: 'POST',
                url: '/api/transaction',
                data: { transaction: transaction }
            });
            result.then((response) => { return this.saved(response); }, Yaba.utils.reject);
            return result;
        }

        saved(response) {
            this.lastSave = ( response.status <= 200 && response.status >= 299 );
            if ( !this.lastSave ) {
                this.saveMessage = response.data.message;
            }
        }
    }

    class Prospect {
        constructor(services) {
            services.hasOwnProperty('$http') && ( this.$http = services.$http );
            services.hasOwnProperty('$scope') && ( this.$scope = services.$scope );
        }

    }

    Yaba.hasOwnProperty('models') || (Yaba.models = {
        AccountTypes: AccountTypes,
        EMPTY_Account: EMPTY_Account,
        EMPTY_Institution: EMPTY_Institution,

        Accounts: Accounts,
        Institutions: Institutions,
        Transactions: Transactions,
        Prospect: Prospect
    });

    return Yaba;
})(Yaba);

(function(Yaba){
    //@TODO: Find a way to derive this from the server.
    const TransactionFields = [
        'datePending',
        'datePosted',
        'accountId',
        'merchant',
        'description',
        'txnType',
        'currency',
        'amount',
        'tags'
    ];

    /* Forms as angular.directive() */
    class InstitutionFormCtrl {
        constructor($scope, $http) {
            // ${this} context here is $scope when functions are assigned like this in the constructor.
            var self = this;
            this.$scope = $scope;
            this.$http = $scope.$http = $http;
            this.$scope.close = this.close;
            $scope.addMapping = this.addMapping;
            this.institution = new Yaba.models.Institutions({ $scope: $scope, $http: $http });
            $scope.transactionFields = TransactionFields;
            this.$scope.save = (e) => {
                self.institution.save();
            };
        }

        close() {
            console.log('InstitutionFormCtl.close-box()');
            this.$parent.seeForm = false;
        }

        addMapping() {
            this.institution.mappings.push({
                fromField: null,
                toField: null,
                mapType: null
            })
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
                return self.accounts.save();
            };
        }

        close() {
            console.log('AccountsFormCtl.close-box()');
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

    class TransactionCollection {
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

    class WishlistWidget {
        constructor($scope, $attrs) {
            $scope.wishlist = $scope.wishlist || [];
            $scope.sortColumn = 'datePosted';
            $scope.sortBy = this.sortBy;
            $scope.add = this.add;
            this.$scope = $scope;
        }

        add() {
            this.wishlist.push({
                amount: this.amount,
                datePurchase: this.datePurchase,
                description: this.description
            });
        }

        sortBy(field) {
            this.sortColumn = field;
        }

    }


    function budgetWidget() {
        BudgetCtrl.$inject = ['$scope', '$http'];
        return {
            templateUrl: '/assets/views/tables/budget.htm',
            controller: BudgetCtrl,
            controllerAs: 'budgetWidget',
            bindToController: true,
            restrict: 'AE'
        };
    }

    function daterangeWidget() {
        return {
            templateUrl: '/assets/views/daterange.htm',
            restrict: 'E'
        }
    }

    function transactionList() {
        TransactionCollection.$inject = ['$scope', '$attrs'];
        return {
            templateUrl: '/assets/views/tables/transactions.htm',
            controller: TransactionCollection,
            scope: {
                'transactions': '='
            },
            restrict: 'E'
        };
    }

    function wishlist() {
        WishlistWidget.$inject = ['$scope', '$attrs'];
        return {
            templateUrl: '/assets/views/prospect/wishlist.htm',
            controller: WishlistWidget,
            scope: {
                wishlist: '='
            },
            restrict: 'E'
        };
    }

    Yaba.hasOwnProperty('components') || (Yaba.components = {
        InstitutionForm: InstitutionFormCtrl,
        AccountForm: AccountFormCtrl,
        BudgetCtrl: BudgetCtrl,
        TransactionCollection: TransactionCollection,
        WishlistWidget: WishlistWidget
    });

    Yaba.app.directive('yabaBudget', budgetWidget);
    Yaba.app.directive('yabaDaterange', daterangeWidget);
    Yaba.app.directive('yabaTransactionList', transactionList);
    Yaba.app.directive('yabaWishlist', wishlist);
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
        budgetBy: budgetBy()
    });

    Yaba.app.filter('budgetBy', budgetBy);
    return Yaba;
})(Yaba);
