/* /assets/js/models-http.js */
(function(Yaba) {
    function accounts($http) {
        return $http({
            method: 'GET',
            url: '/api/accounts'
        });
    }

    function budget($http) {
        return $http({
            method: 'GET',
            url: '/api/budget'
        })
    }

    function institutions($http) {
        return $http({
            method: 'GET',
            url: '/api/institutions'
        });
    }

    function transactions(accountId, $http) {
        return $http({
            method: 'GET',
            url: '/api/transactions',
            params: { accountId: accountId }
        });
    }

    // API calls to the server for data.
    Yaba.hasOwnProperty('http') || ( Yaba.http = {
        getAccounts: accounts,
        getBudget: budget,
        getInstitutions: institutions,
        getTransactions: transactions
    });

    Yaba.hasOwnProperty('utils') || ( Yaba.utils = {
        ajaxError: function ajaxError(response, $scope) {
            console.error(`Error: ${response.statusText}`)
            $scope.error = response.statusText;
        }
    });

    return Yaba;
})(Yaba);
