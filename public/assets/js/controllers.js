/* /assets/js/controllers.js */
/**
 * Controllers
 */
 (function(Yaba) {
    'use strict';

    const x30_DAYS = 2592000000; // 1000ms * 60s * 60m * 24h * 30d

    function distinctSum(transactions=[]) {
        var result = [];
        console.log(transactions);
        this.transactions.forEach(xaction => {
            result.push([ xaction.name, xaction.amount ]);
        })
        return result;
    }

    /**
     * Angular Budget Controller.
     */
    function budget($scope, $http) {
        console.log('Budget controller');
        var services = { $http: $http, $scope: $scope };
        var accts = new Yaba.models.Accounts(services);
        var txns = new Yaba.models.Transactions(services);
        
        $scope.distinctSum = distinctSum;
        $scope.startDate = new Date( Date.now() - x30_DAYS );
        $scope.endDate = new Date();
        $scope.hasOwnProperty('transactions') || ($scope.transactions = []);
        $scope.transactions.sort = 'datePosted';
        $scope.budgets = [];

        accts.load();
        txns.load();
    }

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

        var banks = new Yaba.models.Institutions(services);
        var accts = new Yaba.models.Accounts(services);

        function fetchTransactions(response) {
            response.data.accounts.forEach((account) => {
                var transactions = new Yaba.models.Transactions({
                    $scope: account,
                    $http: $http
                });
                var searchCriteria = {
                    accountId: account.id,
                    fromDate: $scope.fromDate || '-30 days',
                    toDate: $scope.toDate || 'today'
                }
                transactions.load(searchCriteria);
            });
        }

        banks.load();
        var myAccountsPromise = accts.load();
        myAccountsPromise.then((response) => { return fetchTransactions(response); }, Yaba.utils.reject);

        console.log('Yaba.controllers.accounts()');
    }

    /**
     * Account Institutions Controller.
     * @param {angular.service.$scope} $scope Angular $scope service.
     * @param {angular.service.$http} $http Angular $http service.
     */
    function institutions($scope, $http) {
        console.log('Yaba.app.controller(institution).load()');
        $scope.institutions = [];
        $scope.institution = Yaba.models.EMPTY_Institution;

        var banks = new Yaba.models.Institutions({
            $scope: $scope,
            $http: $http
        });
        banks.load();
    }

    function charts($scope, $http) {
        var accts = new Yaba.models.Accounts({$scope: $scope, $http: $http});
        accts.load({ withTransactions: false });
    }

    /**
     * Angular Prospecting Controller.
     */
    function prospect($scope, $http, $attrs) {
        console.log('Prospect controller');
        var services = { $http: $http, $scope: $scope };

        function updateBudgets(value) {
            console.log(value);
            $scope.incomeTxns = Yaba.filters.budgetBy(value, $scope.incomeTags);
            $scope.expenseTxns = Yaba.filters.budgetBy(value, $scope.expenseTags);
        }

        $scope.transactions = [];
        $scope.prospect = [];
        $scope.budgetBy = Yaba.filters.budgetBy;
        $scope.incomeTags = ['income', 'paycheque'];
        $scope.expenseTags = ['billz'];
        $scope.$watch('transactions', updateBudgets);
        // $scope.$watch('incomeTags', updateBudgets);
        // $scope.$watch('expenseTags', updateBudgets);
        var txns = new Yaba.models.Transactions(services);
        txns.load();
    }
    prospect.$inject = ['$scope', '$http', '$attrs'];

    Yaba.hasOwnProperty('controllers') || (Yaba.controllers = {
        budget: ['$scope', '$http', budget],
        accounts: ['$scope', '$http', accounts],
        institutions: ['$scope', '$http', institutions],
        charts: ['$scope', '$http', charts],
        prospect: prospect
    });

    // Register the controllers to the AngularJS interfaces.
    Yaba.app.controller('budget', Yaba.controllers.budget);
    Yaba.app.controller('accounts', Yaba.controllers.accounts);
    Yaba.app.controller('institutions', Yaba.controllers.institutions);
    Yaba.app.controller('charts', Yaba.controllers.charts);
    Yaba.app.controller('prospect', Yaba.controllers.prospect);

    return Yaba;
})(Yaba);
