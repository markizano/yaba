/**
 * AngularJS Controllers
 */
 (function(Yaba) {
    'use strict';

    /**
     * @property {number} ms30days 30 days in milliseconds
     */
    const ms30days = 2592000000; // 1000ms * 60s * 60m * 24h * 30d

    /**
     * Account Institutions Controller.
     */
    function institutions($scope, $timeout, institutions) {
        console.log('Yaba.controllers.institutions()');
        $scope.institutions = institutions;
        $scope.institution = new Yaba.models.Institution();
        $scope.seeForm = false;
        $scope.show = () => {
            console.log('show account form()');
            $scope.seeForm = true;
        };
        $scope.$on('csvParsed', ($event, results) => {
            // only get back the headers from the CSV file.
            var headers = Object.keys(results.data.shift());
            $scope.institution.mappings = [];
            headers.forEach((h) => {
                // Store in variable for later use in function return value.
                // Also: Assign before appending to the list to ensure we use the index we are
                //   setting. (avoids out of index error)
                let i = $scope.institution.mappings.length;
                $scope.institution.mappings.push({
                    fromField: h,
                    toField: '',
                    mapType: 'dynamic',
                    _visible: false
                });
                // Set a timeout to alter the visibility immediately after the element has been
                // rendered on the page to enable the animation.
                $timeout(() => {
                    $scope.institution.mappings[i]._visible = true;
                }, 10);
            });
            // Let AngularJS know about this since the papaparser breaks the promise chain.
            $scope.$apply();
        });
    }
    institutions.$inject = ['$scope', '$timeout', 'institutions'];
    Yaba.app.controller('institutions', institutions);

    /**
     * Angular Accounts controller.
     */
    function accounts($scope, institutions, accounts) {
        console.log('Yaba.controllers.accounts()');
        $scope.accountTypes = Yaba.models.AccountTypes;
        $scope.institutions = institutions;
        $scope.accounts = accounts;
        $scope.account = new Yaba.models.Account();
        $scope.seeForm = false;
        $scope.show = () => {
            console.log('show account form()');
            $scope.seeForm = true;
        };
        $scope.save = () => {
            accounts.push( $scope.account );
            accounts.save($scope);
        }
    }
    accounts.$inject = ['$scope', 'institutions', 'accounts'];
    Yaba.app.controller('accounts', accounts);

    /**
     * Account detail page.
     */
    function account($scope, $routeParams, institutions, accounts) {
        console.log('account-details()');
        $scope.account = accounts.findById($routeParams.accountId);
        $scope.$on('csvParsed', (event, results) => {
            // Get all the transactions back and fill up the table.
            var transactions = Yaba.models.mapInstitution(institutions.findById($scope.account.institutionId), $scope.account, results.data);
            transactions.forEach((txn) => {
                $scope.account.transactions.unshift(new Yaba.models.Transaction(txn));
            });
        });
    }
    account.$inject = ['$scope', '$routeParams', 'institutions', 'accounts'];
    Yaba.app.controller('account', account);

    /**
     * Angular Budget Controller.
     */
    function budget($scope, accounts) {
        console.log('Budget controller');

        $scope.startDate = new Date( Date.now() - ms30days );
        $scope.endDate = new Date();
        $scope.budgets = [];
        $scope.accounts = accounts;
        $scope.transactions = []; //new Yaba.models.Transactions();
        $scope.transactions.sort = 'datePosted';
        accounts.forEach(account => account.transactions.forEach($scope.transactions.push));

    }
    budget.$inject = ['$scope', 'accounts'];
    Yaba.app.controller('budget', budget);

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
    function prospect($scope, accounts, Settings) {
        console.log('Prospect controller');
        function updateBudgets(value) {
            $scope.incomeTxns = Yaba.filters.budgetBy($scope.transactions, $scope.incomeTags);
            $scope.expenseTxns = Yaba.filters.budgetBy($scope.transactions, $scope.expenseTags);
        }
        $scope.transactions     = [];
        $scope.prospect         = [];
        $scope.incomeTxns       = [];
        $scope.expenseTxns      = [];
        $scope.incomeTags       = Settings.incomeTags;
        $scope.expenseTags      = Settings.expenseTags;
        $scope.transferTags     = Settings.transferTags;
        $scope.hideTags         = Settings.hideTags;
        $scope.payCycle         = Settings.payCycle;
        $scope.budgetBy         = Yaba.filters.budgetBy;

        accounts.forEach(account => account.transactions.forEach($scope.transactions.push));
        $scope.$watchCollection('transactions', updateBudgets);
        $scope.$watch('incomeTags', updateBudgets);
        $scope.$watch('expenseTags', updateBudgets);
    }
    prospect.$inject = ['$scope', 'accounts', 'Settings'];
    Yaba.app.controller('prospect', prospect);

    /**
     * Edit/Manage App Settings.
     */
    function settings($scope, Settings) {
        $scope.settings = Settings;
        $scope.settings.load();
        $scope.deleteAll = () => {
            localStorage.clear();
            $scope.$emit('notify', 'Cleared ALL local data.');
        }
    }
    settings.$inject = ['$scope', 'Settings'];
    Yaba.app.controller('settings', settings);

    function pageController($rootScope, $window, institutions, accounts) {
        console.log('Loading and registering institutions and accounts...');
        let institutionStorage = JSON.parse($window.localStorage.getItem('institutions') || '[]'),
        accountStorage = JSON.parse($window.localStorage.getItem('accounts') || '[]');

        institutionStorage.forEach(institutions.push);
        accountStorage.forEach(accounts.push);
        
        $rootScope.$on('save.institution', institutions.store);
        $rootScope.$on('save.institutions', institutions.store);

        $rootScope.$on('save.account', accounts.store);
        $rootScope.$on('save.accounts', accounts.store);

    }
    pageController.$inject = ['$rootScope', '$window', 'institutions', 'accounts'];
    Yaba.app.controller('page', pageController);

    /**
     * ###            Directive Controllers             ###
     */
    function InstitutionFormCtrl($scope, $timeout, institutions) {
        $scope.transactionFields = Yaba.models.TransactionFields;
        $scope.save = () => {
            let fromUser = $scope.institution.toObject();
            institutions.push(fromUser);
            console.log({institutions, institution: fromUser});
            institutions.save($scope);
            $scope.close();
        };

        $scope.remove = function remove($index) {
            $scope.institution.mappings[$index]._visible = false;
            $timeout(() => {
                $scope.institution.mappings.splice($index, 1);
            }, 850);
        }

        $scope.close = function close() {
            $scope.$parent.seeForm = false;
            $timeout($scope.reset, 1000);
        }

        $scope.reset = function reset() {
            $scope.institution = new Yaba.models.Institution();
            $scope.institution.mappings[0]._visible = true;
        }

        $scope.addMapping = function addMapping() {
            $scope.institution.mappings.push({
                fromField: '',
                toField: '',
                mapType: '',
                _visible: false,
            });
            $timeout(() => {
                $scope.institution.mappings[$scope.institution.mappings.length-1]._visible = true;
            }, 10);
        };

        $scope.reset();
    }
    InstitutionFormCtrl.$inject = ['$scope', '$timeout', 'institutions'];
    Yaba.app.controller('yabaInstitutionCtrl', InstitutionFormCtrl);

    function AccountFormCtrl($scope, $timeout, accounts) {
        $scope.save = () => {
            accounts.push($scope.account);
            accounts.save($scope);
        };

        $scope.close = function close() {
            $scope.$parent.seeForm = false;
            $timeout($scope.reset, 1000);
        }

        $scope.reset = function reset() {
            $scope.account = new Yaba.models.Account();
        }
    }
    AccountFormCtrl.$inject = ['$scope', '$timeout', 'accounts'];
    Yaba.app.controller('yabaAccountCtrl', AccountFormCtrl);

    function BudgetCtrl($scope, accounts) {
        $scope.transactions = [];
        accounts.forEach(account => account.transactions.forEach($scope.transactions.push));

        $scope.uniques = function uniques() {
            var seen = [];
            $scope.transactions.forEach((transaction) => {
                transaction.tags.forEach((tag) => {
                    if ( seen.includes(tag) ) return;
                    seen.push(tag);
                });
            });
            return seen;
        }

        $scope.budgets = function budgets() {
            var results = {};
            $scope.transactions.forEach((transaction) => {
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
    }
    BudgetCtrl.$inject = ['$scope', 'accounts'];
    Yaba.app.controller('yabaBudgetCtrl', BudgetCtrl);

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

        $scope.sortBy = function sortBy(field) {
            $scope.sortColumn = field;
        }

        $scope.save = function save() {
            console.log('save-transaction()');
        }
    }
    TransactionListCtrl.$inject = ['$scope', '$attrs'];
    Yaba.app.controller('yabaTransactionListCtrl', TransactionListCtrl);

    return Yaba;
})(Yaba);
