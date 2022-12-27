(function(Yaba) {
    /**
     * Storage implementation that uses the browser for storage.
     * You can $inject AngularJS objects to this with respect to angular.service() calls are concerned.
     * That means you do not get access to $scope in any of the requests for storage.
     * @param {Object} collection Document declaring the collection.name and collection.type details.
     * @param {Array} dataCollection List of items to be included in the initial data set.
     */
    function BrowserStorage(collection, dataCollection=[]) {
        // Exceptions are for developers.
        if ( ! dataCollection instanceof Array ) {
            throw new TypeError('Data Collection must be an array/collection.');
        }
        if ( !collection.name ) {
            throw new TypeError('Collection must be named.');
        }
        if ( !collection.type ) {
            throw new TypeError('Collection Needs a data type.');
        }
        if ( collection.type instanceof Function ) {
            throw new TypeError('Collection.type Needs a data type.');
        }
        this.push = (...items) => {
            for (var i in items) {
                let item = items[i];
                item instanceof collection.type || (items[i] = new collection.type(item));
            }
            return Array(this).push(items);
        }
        this.unshift = (...items) => {
            for (var i in items) {
                let item = items[i];
                item instanceof collection.type || (items[i] = new collection.type(item));
            }
            return Array(this).unshift(items);
        }
        this.pop = Array(this).pop;
        this.shift = Array(this).shift;


        return (service, $scope) => {
            this = new StorageInterface();
            console.log(`new BrowserStorage(${service})`);
            const modelName = service[0].toUpperCase() + service.slice(1);
            const model = new Yaba.models[modelName]();
            model.load = ($scope) => {
                console.log(`BrowserStorage.load(${service})`);
                var collection = JSON.parse( $window.localStorage.getItem(service) || '[]' );
                const modelName = service[0].toUpperCase() + service.slice(1);
                return $scope[service] = new Yaba.models[modelName](collection);
            };

            model.store = ($scope) => {
                console.log(`BrowserStorage.store(${service})`);
                $window.localStorage.setItem(service, $scope[service].toString() );
                return this;
            }
    
            return model;
        };
    }

    Yaba.hasOwnProperty('storage') || (Yaba.storage = {});
    Yaba.storage.BrowserStorage = BrowserStorage;

    function institutionStorage($rootScope, $scope, institutions) {
        const onsave = () => {
            console.log('captured global save event for institutions');
            institutions.save($scope);
        };
        $rootScope.$on('save.institution', onsave);
        $rootScope.$on('save.institutions', onsave);
        institutions.load($scope);
    }
    institutionStorage.$inject = ['$rootScope', '$scope', 'institutions'];
    Yaba.app.controller('institutionsStorage', institutionStorage);

    function accountStorage($rootScope, $scope, accounts) {
        const onsave = () => {
            console.log('captured global save event for accounts');
            accounts.save($scope);
        };
        $rootScope.$on('save.account', onsave);
        $rootScope.$on('save.accounts', onsave);
        accounts.load($scope);
    }
    accountStorage.$inject = ['$rootScope', '$scope', 'accounts'];
    Yaba.app.controller('accountsStorage', accountStorage);
})(Yaba);
