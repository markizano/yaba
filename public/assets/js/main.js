console.log('#define');

var yaba = angular.module('yaba', ['ngRoute']);

yaba.config(function($locationProvider, $routeProvider) {
    $locationProvider.html5Mode(true);
    //$locationProvider.hashPrefix('#');
    const pages = [
        '/home',
        '/accounts',
        '/budget',
        '/institutions',
        '/settings'
    ];
    pages.forEach((page) => {
        $routeProvider.when(page, { templateUrl: `/assets/views/${page}.htm` });
    })
    $routeProvider.otherwise({ template: '<h1>404</h1><p>Page not found!</p><br />Route: {{ $route }}' });
});

yaba.controller('accounts', function($scope, $http) {
    console.log('Accounts controller.');
    $scope.newAccount = function() {
        console.log('NewAccount()');
    };
    $http.get('/api/accounts').then(function(response) {
        $scope.accounts = response.data.accounts;
        $scope.accounts.forEach((account) => {
            $http({
                method: 'GET',
                url: '/api/transactions',
                params: {
                    accountId: account.id
                }
            }).then(function(response) {
                console.log('Got transactions too!')
                account.transactions = response.data.transactions;
            }, function(response) {
                $scope.error = response.statusText;
            })
        })
    }, function(response) {
        $scope.error = response.statusText;
    });

});

console.log('after-load');
