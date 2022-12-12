/* /assets/js/controllers.js */
/**
 * Controllers
 */
 (function(Yaba) {
    'use strict';

    const x30_DAYS = 2592000000; // 1000ms * 60s * 60m * 24h * 30d

    /**
     * Angular Budget Controller.
     */
    function budget($scope, $http) {
        console.log('Budget controller');
        var services = { $http: $http, $scope: $scope };
        var accts = new Yaba.models.Accounts(services);
        var txns = new Yaba.models.Transactions(services);
        
        $scope.startDate = new Date( Date.now() - x30_DAYS );
        $scope.endDate = new Date();
        $scope.hasOwnProperty('transactions') || ($scope.transactions = []);
        $scope.transactions.sort = 'datePosted';
        $scope.budgets = [];

        accts.load();
        txns.load();
    }
    budget.$inject = ['$scope', '$http'];

    /**
     * Angular Accounts controller.
     * @param {angular.service.$scope} $scope angular controller $scope service.
     * @param {angular.service.$http} $http angular controller $http service.
     */
    function accounts($scope, $http) {
        var services = { $http: $http, $scope: $scope };
        $scope.accountTypes = Yaba.models.AccountTypes;
        $scope.institutions = [];
        $scope.accounts = [];
        $scope.account = {};

        var banks = new Yaba.models.Institutions(services);
        var accts = new Yaba.models.Accounts(services);

        function fetchTransactions(response) {
            response.data.accounts.forEach((account) => {
                var transactions = new Yaba.models.Transactions({
                    $scope: account,
                    $http: $http
                });
                var searchCriteria = {
                    accountId: account.accountId,
                    fromDate: $scope.fromDate || (new Date() - x30_DAYS),
                    toDate: $scope.toDate || new Date()
                }
                transactions.load(searchCriteria);
            });
        }

        banks.load();
        var myAccountsPromise = accts.load();
        myAccountsPromise.then((response) => { return fetchTransactions(response); }, Yaba.utils.reject);
        $scope.seeForm = false;
        $scope.show = function showForm() {
            $('#new-account').hasClass('ng-show') || ($('#new-account').addClass('ng-show'));
        }

        console.log('Yaba.controllers.accounts()');
    }
    accounts.$inject = ['$scope', '$http'];

    /**
     * Account Institutions Controller.
     * @param {angular.service.$scope} $scope Angular $scope service.
     * @param {angular.service.$http} $http Angular $http service.
     */
    function institutions($scope, $http) {
        console.log('Yaba.app.controller(institution).load()');
        $scope.institutions = [];
        $scope.institution = Yaba.models.EMPTY_Institution;
        $scope.seeForm = false;

        var banks = new Yaba.models.Institutions({
            $scope: $scope,
            $http: $http
        });
        banks.load();
    }
    institutions.$inject = ['$scope', '$http'];

    function charts($scope, $http) {
        var accts = new Yaba.models.Accounts({$scope: $scope, $http: $http});
        accts.load({ withTransactions: false });
    }
    charts.$inject = ['$scope', '$http'];

    /**
     * Angular Prospecting Controller.
     */
    function prospect($scope, $http, $window) {
        console.log('Prospect controller');
        var services = { $http: $http, $scope: $scope };

        function updateBudgets(value) {
            $scope.incomeTxns = Yaba.filters.budgetBy($scope.transactions, $scope.incomeTags);
            $scope.expenseTxns = Yaba.filters.budgetBy($scope.transactions, $scope.expenseTags);
        }

        $scope.transactions = [];
        $scope.prospect = [];
        $scope.incomeTxns = [];
        $scope.expenseTxns = [];
        $scope.incomeTags = $window.localStorage.getItem('incomeTags').split(',').filter(x => x) || [];
        $scope.expenseTags = $window.localStorage.getItem('expenseTags').split(',').filter(x => x) || [];
        $scope.transferTags = $window.localStorage.getItem('transferTags').split(',').filter(x => x) || [];
        $scope.payCycle = $window.localStorage.getItem('payCycle') || '';
        $scope.budgetBy = Yaba.filters.budgetBy;
        $scope.$watchCollection('transactions', updateBudgets);
        $scope.$watch('incomeTags', updateBudgets);
        $scope.$watch('expenseTags', updateBudgets);

        var txns = new Yaba.models.Transactions(services);
        txns.load();
    }
    prospect.$inject = ['$scope', '$http', '$window'];

    function settings($scope, $window) {
        const tagTypes = [
            'income',
            'expense',
            'transfer',
            'hide'
        ];
        tagTypes.forEach(tagType => {
            var t = `${tagType}Tags`;
            $scope[t] = ($window.localStorage.getItem(t) || '').split(',').filter(x => x) || [];
        });
        $scope.payCycle = $window.localStorage.getItem('payCycle') || '';

        $scope.saveSettings = function saveSettings() {
            tagTypes.forEach(tagType => {
                var field = `${tagType}Tags`;
                $window.localStorage.setItem(field, Array($scope[field]).join(','));
            });
            $window.localStorage.setItem('payCycle', $scope.payCycle);
        }
    }
    settings.$inject = ['$scope', '$window'];

    Yaba.hasOwnProperty('controllers') || (Yaba.controllers = {
        budget: budget,
        accounts: accounts,
        institutions: institutions,
        charts: charts,
        prospect: prospect,
        settings: settings,
    });

    // Register the controllers to the AngularJS interfaces.
    Yaba.app.controller('budget', Yaba.controllers.budget);
    Yaba.app.controller('accounts', Yaba.controllers.accounts);
    Yaba.app.controller('institutions', Yaba.controllers.institutions);
    Yaba.app.controller('charts', Yaba.controllers.charts);
    Yaba.app.controller('prospect', Yaba.controllers.prospect);
    Yaba.app.controller('settings', Yaba.controllers.settings);

    return Yaba;
})(Yaba);
