/* /assets/js/controllers.js */
/**
 * Controllers
 */
 (function(Yaba) {
    'use strict';

    /**
     * @property {number} ms30days 30 days in milliseconds
     */
    const ms30days = 2592000000; // 1000ms * 60s * 60m * 24h * 30d


    /**
     * Angular Budget Controller.
     */
    function budget($scope, accounts) {
        console.log('Budget controller');

        $scope.startDate = new Date( Date.now() - ms30days );
        $scope.endDate = new Date();
        $scope.budgets = [];
        $scope.accounts = accounts;
        $scope.transactions = [];
        $scope.transactions.sort = 'datePosted';
        accounts.forEach(account => account.transactions.forEach($scope.transactions.push));

    }
    budget.$inject = ['$scope', 'accounts'];
    Yaba.app.controller('budget', budget);

    /**
     * Angular Accounts controller.
     */
    function accounts($scope, institutions, accounts) {
        console.log('Yaba.controllers.accounts()');
        $scope.accountTypes = Yaba.models.AccountTypes;
        $scope.institutions = institutions;
        $scope.accounts = accounts;
        $scope.account = {};
        $scope.seeForm = false;
    }
    accounts.$inject = ['$scope', 'institutions', 'accounts'];
    Yaba.app.controller('accounts', accounts);

    /**
     * Account detail page.
     */
    function account($scope, $routeParams, institutions, accounts) {
        console.log('account-details()');
        console.log($scope);
        console.log($routeParams);
        $scope.account = accounts.filter(a => a.accountId == $routeParams.accountId).unshift();
        $scope.institution = institutions.filter(i => i.institutionId == $scope.account.institutionId).unshift();
        $scope.transactions = $scope.account.transactions;
    }
    account.$inject = ['$scope', '$routeParams', 'institutions', 'accounts'];
    Yaba.app.controller('account', account);

    /**
     * Account Institutions Controller.
     */
    function institutions($scope, institutions) {
        console.log('Yaba.app.controller(institution).load()');
        $scope.institutions = institutions;
        $scope.institution = new Yaba.models.Institution({mappings: [{}]});
        $scope.seeForm = false;
    }
    institutions.$inject = ['$scope', 'institutions'];
    Yaba.app.controller('institutions', institutions);

    /**
     * Charts and Graphs of Budgets created.
     */
    function charts($scope, accounts) {
        $scope.accounts = accounts;
    }
    charts.$inject = ['$scope', 'accounts'];
    Yaba.app.controller('charts', charts);

    /**
     * Angular Prospecting Controller.
     */
    function prospect($scope, accounts) {
        console.log('Prospect controller');
        const settings = new Yaba.models.Settings();

        function updateBudgets(value) {
            $scope.incomeTxns = Yaba.filters.budgetBy($scope.transactions, $scope.incomeTags);
            $scope.expenseTxns = Yaba.filters.budgetBy($scope.transactions, $scope.expenseTags);
        }

        $scope.transactions     = [];
        $scope.prospect         = [];
        $scope.incomeTxns       = [];
        $scope.expenseTxns      = [];
        $scope.incomeTags       = settings.incomeTags;
        $scope.expenseTags      = settings.expenseTags;
        $scope.transferTags     = settings.transferTags;
        $scope.hideTags         = settings.hideTags;
        $scope.payCycle         = settings.payCycle;
        $scope.budgetBy         = Yaba.filters.budgetBy;

        accounts.forEach(account => account.transactions.forEach($scope.transactions.push));
        $scope.$watchCollection('transactions', updateBudgets);
        $scope.$watch('incomeTags', updateBudgets);
        $scope.$watch('expenseTags', updateBudgets);

        var txns = new Yaba.models.Transactions(services);
        txns.load();
    }
    prospect.$inject = ['$scope', 'accounts'];
    Yaba.app.controller('prospect', prospect);

    /**
     * Edit/Manage App Settings.
     */
    function settings($scope) {
        $scope.settings = new Yaba.models.Settings();

        $scope.saveSettings = () => {
            $scope.settings.save();
        };
    }
    settings.$inject = ['$scope'];
    Yaba.app.controller('settings', settings);

    function pageController($scope) {
        $scope.hasOwnProperty('institutions') || ($scope.institutions = []);
        $scope.hasOwnProperty('accounts') || ($scope.accounts = []);
        $scope.hasOwnProperty('transactions') || ($scope.transactions = []);
    }
    pageController.$inject = ['$scope'];
    Yaba.app.controller('page', pageController);

    /**
     * ###            Directive Controllers             ###
     */
    function InstitutionFormCtrl($scope, $http, $timeout) {
        const self = this;
        this.$scope = $scope;
        this.$http = $http;
        this.$timeout = $timeout;

        $scope.save = this.save;
        $scope.close = this.close;
        $scope.remove = this.remove;
        $scope.reset = this.reset;
        $scope.addMapping = this.addMapping;

        this.institution = new Yaba.models.Institution();
        $scope.transactionFields = Yaba.models.TransactionFields;

        this.save = function save(e) {
            this.institution.save();
        }
        this.remove = function remove($index) {
            this.institution.mappings.splice($index, 1);
        }

        this.close = function close() {
            this.$parent.seeForm = false;
            self.$timeout(self.reset, 1000);
        }

        this.reset = function reset() {
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

        this.addMapping = function addMapping() {
            this.institution.mappings.push({
                fromField: '',
                toField: '',
                mapType: '',
            });
        };

        return this;
    }
    InstitutionFormCtrl.$inject = ['$scope', '$http', '$timeout'];
    Yaba.app.controller('yabaInstitutionForm', InstitutionFormCtrl);

    function AccountFormCtrl($scope, accounts) {
        var self = this;
        this.$scope = $scope;
        this.$scope.close = this.close;
        this.accounts = accounts;
        this.$scope.save = () => {
            return self.accounts.save();
        };

        this.close = () => {
            // this.$animate.removeClass($('#new-account'), 'ng-show');
            self.$scope.$parent.seeForm = false;
        };

        return this;
    }
    AccountFormCtrl.$inject = ['$scope', 'accounts'];
    Yaba.app.controller('yabaAccountForm', AccountFormCtrl);

    function BudgetCtrl($scope) {
        this.$scope = $scope;

        function uniques() {
            var seen = [];
            this.transactions.forEach((transaction) => {
                transaction.tags.forEach((tag) => {
                    if ( seen.includes(tag) ) return;
                    seen.push(tag);
                });
            });
            return seen;
        }

        function budgets() {
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

        $scope.uniques = uniques;
        $scope.budgets = budgets;
    }
    BudgetCtrl.$inject = ['$scope', '$http'];
    Yaba.app.controller('yabaBudget', BudgetCtrl);

    /**
     * Renders a collection of transactions. Controller for handling the list of transactions
     * and however we may want to render them.
     */
    function TransactionListCtrl($scope, $attrs) {
        // By default, don't show tags. We can override this in the HTML include for this widget.
        $scope.includeTags = $attrs.hasOwnProperty('includeTags');
        $scope.withHeader = !$attrs.hasOwnProperty('withoutHeader');
        $scope.limit = $attrs.limit || -1;
        $scope.sortColumn = 'datePosted';
        this.$scope = $scope;

        function sortBy(field) {
            $scope.sortColumn = field;
        }

        function save() {
            console.log('save-transaction()');
            console.log(this);
        }
        $scope.sortBy = sortBy;
        $scope.save = save;
    }
    TransactionListCtrl.$inject = ['$scope', '$attrs'];
    Yaba.app.controller('yabaTransactionList', TransactionListCtrl);

    return Yaba;
})(Yaba);
