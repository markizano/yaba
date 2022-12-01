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
            const self = this;
            var result = this.$http({
                method: 'GET',
                url: '/api/accounts'
            });

            function gotAccounts(response) {
                self.$scope.accounts = [];
                response.data.accounts.forEach( (account) => {
                    self.$scope.accounts.push(account);
                });
            }

            result.then(gotAccounts);
            return result;
        }

        /**
         * Save an account to the server based on what is in the local scope.
         * @returns null
         */
        save() {
            options = {
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
            return this.$http({
                method: 'POST',
                url: '/api/accounts',
                data: options
            })
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
            return this.$http({
                method: 'GET',
                url: '/api/transactions',
                data: options
            }).then(function(response) {
                self.$scope.hasOwnProperty('transactions') || (self.$scope.transactions = []);
                response.data.transactions.forEach(txn => {
                    self.$scope.transactions.push(txn);
                })
            });

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
                tags: ( (tags) => {
                    var result = [];
                    tags.forEach(tag => {
                        result.push(tag);
                    })
                    return result;
                })( this.$scope.tags.split(',') )
            };
            return this.$http({
                method: 'POST',
                url: '/api/transactions',
                data: { transaction: transaction }
            });
        }
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
            var self = this;
            return this.$http({
                method: 'GET',
                url: '/api/institutions'
            }).then(function(response) {
                return self.$scope.institutions = response.data.institutions;
            });
        }

        /**
         * Save an institution to the server.
         * @param {Interface Institution} institution The Institution we are saving to the server.
         * @returns HTTPResponse.
         */
        save() {
            var options = {
                institution: {
                    name: this.$scope.institution.name,
                    description: this.$scope.institution.description,
                    mappings: []
                }
            };
            var self = this;
            this.$scope.institution.mappings.forEach( (mapping) => {
                options.institution.mappings.push({
                    fromField: mapping.fromField,
                    toField: mapping.toField,
                    mapType: mapping.mapType
                })
            });
            this.$http({
                method: 'POST',
                url: '/api/institutions',
                data: options
            }).then((response) =>{
                self.saved(response);
            });
            console.log('call Institution.save()');
            return this;
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
            this.$scope.save = (e) => {
                self.institution.save();
            };
        }

        close() {
            console.log('InstitutionFormCtl.close-box()');
        }

        addMapping() {
            this.institution.mappings.push({
                fromField: null,
                toField: null,
                mapType: null
            })
        };

    }

    class AccountFormCtrl {
        constructor($scope, $http) {
            // ${this} context here is $scope when functions are assigned like this in the constructor.
            var self = this;
            this.$scope = $scope;
            this.$http = $scope.$http = $http;
            this.$scope.close = this.close;
            this.account = new Yaba.models.Accounts({ $scope: $scope, $http: $http });
            this.$scope.save = (e) => {
                self.account.save();
            };
        }

        close() {
            console.log('AccountsFormCtl.close-box()');
        }

    }

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
            // console.log($attrs);
            $scope.includeTags = $attrs.hasOwnProperty('includeTags');
            $scope.withHeader = !$attrs.hasOwnProperty('withoutHeader');
            $scope._transactions = $scope.telescope($attrs.ngModel);
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

    function institutionForm() {
        InstitutionFormCtrl.$inject = ['$scope', '$http'];
        return {
            templateUrl: '/assets/views/forms/institution.htm',
            controller: InstitutionFormCtrl,
            controllerAs: 'institutionForm',
            bindToController: true,
            restrict: 'AE'
        };
    }

    function accountForm() {
        AccountFormCtrl.$inject = ['$scope', '$http'];
        return {
            templateUrl: '/assets/views/forms/account.htm',
            controller: AccountFormCtrl,
            controllerAs: 'accountForm',
            bindToController: true,
            restrict: 'AE'
        };
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
            controllerAs: 'budgetWidget',
            bindToController: true,
            restrict: 'AE'
        };
    }

    Yaba.hasOwnProperty('components') || (Yaba.components = {
        InstitutionForm: InstitutionFormCtrl,
        AccountForm: AccountFormCtrl,
        BudgetCtrl: BudgetCtrl,
        TransactionCollection: TransactionCollection
    });

    Yaba.app.directive('yabaInstitutionForm', institutionForm);
    Yaba.app.directive('yabaAccountForm', accountForm);
    Yaba.app.directive('yabaBudget', budgetWidget);
    Yaba.app.directive('yabaDaterange', daterangeWidget);
    Yaba.app.directive('yabaTransactionList', transactionList);
})(Yaba);

(function(Yaba) {
    /* angular.filter() */
    function budgetBy() {
        return (transactions, incomeTags) => {
            if ( !transactions ) return transactions;
            if ( !incomeTags ) return transactions;
            var result = [];
            transactions.forEach((transaction) => {
                if ( typeof incomeTags == 'string' ) {
                    incomeTags = incomeTags.split(',');
                }
                incomeTags.forEach((incomeTag) => {
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
