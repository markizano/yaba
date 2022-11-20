/* /assets/js/controllers.js */
/**
 * Controllers
 */
 (function(Yaba) {
    const EMPTY_INSTITUTION = {
        name: null,
        description: null,
        mappings: [
            {
                fromField: null,
                toField: null,
                mapType: null
            }
        ]
    };

    /**
     * Angular Budget Controller.
     */
    function budget($scope, $http) {
        console.log('Budget controller');
    }

    /**
     * Angular Accounts controller.
     * @param {angular.service.$scope} $scope angular controller $scope service.
     * @param {angular.service.$http} $http angular controller $http service.
     */
    function accounts($scope, $http) {
        console.log('Accounts controller.');

        model = new Yaba.models.Institution({
            http: $http,
            scope: $scope
        });
        model.get();
        Yaba.models.getAccounts($http).then(function(response) {
            return Yaba.models.gotAccounts(response.data, $scope);
        }, function(response) {
            return Yaba.utils.ajaxError(response, $scope);
        });

        Yaba.http.getInstitutions($http).then(function(response) {
            return Yaba.models.gotInstitutions(response.data, $scope);
        }, (response) => Yaba.utils.ajaxError(response, $scope));
    }

    /**
     * Account Institutions Controller.
     * @param {angular.service.$scope} $scope Angular $scope service.
     * @param {angular.service.$http} $http Angular $http service.
     */
    function institutions($scope, $http) {
        var model = new Yaba.models.Institution({
            $scope: $scope,
            $http: $http
        });
        model.load()
        if ( !$scope.hasOwnProperty('institution') ) {
            $scope.institution = EMPTY_INSTITUTION;
        }

        $scope.addMapping = function addMapping() {
            $scope.institution.mappings.push({
                fromField: null,
                toField: null,
                mapType: 'dynamic'
            })
        }
    }

    /**
     * Angular Prospecting Controller.
     */
    function prospect($scope, $http) {
        console.log('Prospect controller');
    }

    // Register the controllers to the AngularJS interfaces.
    Yaba.controller('budget', ['$scope', '$http', budget]);
    Yaba.controller('accounts', ['$scope', '$http', accounts]);
    Yaba.controller('institutions', ['$scope', '$http', institutions]);
    Yaba.controller('prospect', ['$scope', '$http', prospect]);
    return Yaba;
})(Yaba);
