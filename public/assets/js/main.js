console.log('#define');

var yaba = (function(yaba) {
    // API calls to the server for data.
    yaba.getInstitutions = function($http) {
        return $http({
            method: 'GET',
            url: '/api/institutions'
        });
    };

    yaba.getAccounts = function($http) {
        return $http({
            method: 'GET',
            url: '/api/accounts'
        });
    };

    yaba.getTransactions = function($http, accountId) {
        return $http({
            method: 'GET',
            url: '/api/transactions',
            params: { accountId: accountId }
        });
    };

    // Generic HTML stuff leveraging AngularJS
    yaba.showNewItem = false;
    yaba.showNew = function showNew() {
        yaba.showNewItem = true;
    };
    yaba.showNew = function showNew() {
        yaba.showNewItem = false;
    };

    // AngularJS Client Interactions
    yaba.pageConfig = function pageConfig($locationProvider, $routeProvider) {
        $locationProvider.html5Mode(true);
        const pages = [
            '/home',
            '/budget',
            '/prospect',
            '/charts',
            '/accounts',
            '/institutions',
            '/settings'
        ];
        pages.forEach((page) => {
            $routeProvider.when(page, { templateUrl: `/assets/views/${page}.htm` });
        })
        $routeProvider.when('/', { templateUrl: `/assets/views/home.htm` });
        $routeProvider.otherwise({ template: '<h1>404</h1><p>Page not found!</p><br />Route: {{ $route }}' });
    };

    yaba.accounts = ['$scope', '$http', function accounts($scope, $http) {
        console.log('Accounts controller.');
        $scope.newAccount = function() {
            console.log('NewAccount()');
        };
        yaba.getAccounts($http).then(function(response) {
            $scope.accounts = response.data.accounts;
            $scope.accounts.forEach((account) => {
                yaba.getTransactions($http, account.id)
                  .then(function(response) {
                    console.log('Got transactions too!')
                    account.transactions = response.data.transactions;
                  }, function(response) {
                    $scope.error = response.statusText;
                  }
                );
            });
        }, function(response) {
            console.error(`Error: ${response.statusText}`)
            $scope.error = response.statusText;
        });
        console.log(`Account types: ${$scope.accountTypes}`);
    }];

    yaba.newAccount = ['$scope', '$http', function newAccount($scope, $http) {
        $scope.accountTypes = ['checking', 'savings', 'broker', 'credit', 'loan', 'crypto'];
        yaba.getInstitutions($http).then(function(response) {
            console.log(`Got institutions: ${response.data.institutions}`);
            var result = [];
            response.data.institutions.forEach((inst) => {
                result.push(inst.name)
            });
            $scope.institutions = result;
        }, function(response) {
            console.error(`Error: ${response.statusText}`)
            $scope.error = response.statusText;
        });
    }];

    yaba.institutions = ['$scope', '$http', function institutions($scope, $http) {
        yaba.getInstitutions($http).then(function(response) {
            $scope.institutions = response.data.institutions;
        }, function(response) {
            $scope.error = response.statusText;
        });
    }];

    yaba.newInstitution = ['$scope', '$http', function newInstitution($scope, $http) {
        if ( !$scope.hasOwnProperty('institution') ) {
            $scope.institution = {
                mappings: [
                    {
                        fromField: null,
                        toField: null,
                        mapType: 'dynamic'
                    }
                ]
            };
        }

        $scope.addMapping = function addMapping() {
            $scope.institution.mappings.push({
                fromField: null,
                toField: null,
                mapType: 'dynamic'
            })
        }
    }];

    return yaba;
})(angular.module('yaba', ['ngRoute']));

yaba.config(yaba.pageConfig);

yaba.controller('accounts', yaba.accounts);
yaba.controller('newAccount', yaba.newAccount)

yaba.controller('institutions', yaba.institutions);
yaba.controller('newInstitution', yaba.newInstitution);

console.log('after-load');
