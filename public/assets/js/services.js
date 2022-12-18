/**
 * 
 */
(function(Yaba) {
    'use strict';

    Yaba.hasOwnProperty('data') || (Yaba.data = {});

    function BrowserStorage($scope, $window, $attrs) {
        this.$scope = $scope;
        this.$window = $window;
        this.services = ['institutions', 'accounts'];
        Yaba.data.institutions || (Yaba.data.institutions = []);
        Yaba.data.accounts || (Yaba.data.accounts = []);

        this.load = () => {
            this.services.forEach((service) => {
                var serviceList = JSON.parse( $window.localStorage.getItem(service) || '[]' ), result = [];
                serviceList.forEach((data) => {
                    let modelName = service[0].toUpperCase() + service.slice(1, service.length - 1);
                    result.push( new Yaba.models[ modelName ](data) );
                })
                return Yaba.data[service] = result;
            });
            
            return this;
        }

        this.save = () => {
            this.services.forEach((service) => {
                $window.localStorage.setItem(service, JSON.stringify( Yaba.data[service] ) );
            });
            
            return this;
        }

        if ( $attrs.autoLoad ) {
            this.load();
        }

        return this;
    }
    BrowserStorage.$inject = ['$scope', '$window', '$attrs'];
    Yaba.app.factory('browserStorage', BrowserStorage);

    // These services are short handles so we can access them from controllers.
    Yaba.app.factory('institutions', () => Yaba.data.institutions);
    Yaba.app.factory('accounts', () => Yaba.data.accounts);

    return Yaba;
})(Yaba);
