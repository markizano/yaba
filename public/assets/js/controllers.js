/* /assets/js/controllers.js */
/**
 * Controllers
 */
 (function(Yaba) {

    const x30_DAYS = 2592000000;

    function distinctSum(transactions=[]) {
        var result = [];
        console.log(transactions);
        transactions.forEach(xaction => {
            result.push([ xaction.name, xaction.amount ])
        })
        return result;
    }

    /**
     * Angular Budget Controller.
     */
    function budget($scope, $http) {
        console.log('Budget controller');
        services = { $http: $http, $scope: $scope };
        var xactions = new Yaba.models.Transactions(services);
        xactions.load();
        $scope.distinctSum = distinctSum;
        $scope.startDate = new Date( Date.now() - x30_DAYS );
        $scope.endDate = new Date();
    }

    /**
     * Angular Accounts controller.
     * @param {angular.service.$scope} $scope angular controller $scope service.
     * @param {angular.service.$http} $http angular controller $http service.
     */
    function accounts($scope, $http) {
        services = { $http: $http, $scope: $scope };
        $scope.accountTypes = Yaba.models.AccountTypes;
        $scope.institutions = [];
        $scope.accounts = [];

        var accts = new Yaba.models.Accounts(services);
        var banks = new Yaba.models.Institutions(services);

        accts.load({ withTransactions: true });
        banks.load();
    }

    /**
     * Account Institutions Controller.
     * @param {angular.service.$scope} $scope Angular $scope service.
     * @param {angular.service.$http} $http Angular $http service.
     */
    function institutions($scope, $http) {
        console.log('Yaba.app.controller(institution).load()');
        $scope.institutions = [{}];
        $scope.institution = Yaba.models.EMPTY_Institution;
        $scope.addMapping = function addMapping() {
            $scope.institution.mappings.push({
                fromField: null,
                toField: null,
                mapType: null
            })
        };

        var banks = new Yaba.models.Institutions({
            $scope: $scope,
            $http: $http
        });
        banks.load();
    }

    function charts($scope, $http, $timeout) {
        $scope.$watch('$viewContentLoaded', () => {
            $timeout(() => {
                let dtopts = {
                    changeMonth: true,
                    changeYear: true,
                    dateFormat: "yy-mm-dd"
                };
                $('fromDate').datepicker(dtopts);
                $('toDate').datepicker(dtopts);
                console.log('document.datepicker()');
            }, 0);
        });
        var accts = new Yaba.models.Accounts({$scope: $scope, $http: $http})
        accts.load({ withTransactions: false });
    }

    /**
     * Angular Prospecting Controller.
     */
    function prospect($scope, $http) {
        console.log('Prospect controller');
    }

    Yaba.hasOwnProperty('controllers') || (Yaba.controllers = {
        budget: ['$scope', '$http', budget],
        accounts: ['$scope', '$http', accounts],
        institutions: ['$scope', '$http', institutions],
        prospect: ['$scope', '$http', prospect],
        charts: ['$scope', '$http', '$timeout', charts]
    })

    // Register the controllers to the AngularJS interfaces.
    Yaba.app.controller('budget', Yaba.controllers.budget);
    Yaba.app.controller('accounts', Yaba.controllers.accounts);
    Yaba.app.controller('institutions', Yaba.controllers.institutions);
    Yaba.app.controller('charts', Yaba.controllers.charts);
    Yaba.app.controller('prospect', Yaba.controllers.prospect);

    return Yaba;
})(Yaba);
