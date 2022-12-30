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
     * @property {Number} animationDelay How long the CSS is configured to animate stuff (in MS).
     */
    const animationDelay = 400;

    /**
     * Account Institutions Controller.
     */
    function institutions($scope, $timeout, institutions) {
        console.log('Yaba.controllers.institutions()');
        $scope.institutions = institutions;
        $scope.institution = new Yaba.models.Institution();
        $scope.seeForm = false;
        $scope.add = () => {
            console.log('show account form()');
            $scope.seeForm = true;
            $scope.mode = 'add';
        };
        $scope.edit = (institution) => {
            console.log(`edit(${institution})`)
            $scope.institution = institution;
            $scope.seeForm = true;
            $scope.mode = 'edit';
            $timeout(() => {
                institution.mappings.forEach(mapping => {
                    mapping._visible = true;
                });
            }, animationDelay);
        };
        $scope.remove = (institution) => {
            for ( let i in institutions ) {
                if ( institutions[i].id == institution.id ) {
                    institutions.splice(i, 1);
                }
            }
            institutions.save($scope);
        };
        $scope.$on('csvParsed', ($event, results) => {
            // only get back the headers from the CSV file.
            var headers = Object.keys(results.parsedCSV.data.shift());
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
                }, 100);
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
        $scope.accountTypes = Yaba.models.Account.Types;
        $scope.institutions = institutions;
        $scope.accounts = accounts;
        $scope.account = new Yaba.models.Account();
        $scope.seeForm = false;
        $scope.mode = 'edit';
        $scope.add = () => {
            $scope.seeForm = true;
            $scope.mode = 'add';
        };
        $scope.edit = (account) => {
            $scope.account = account;
            $scope.seeForm = true;
            $scope.mode = 'edit';
        }
        $scope.remove = (account) => {
            for ( let i in accounts ) {
                if ( accounts[i].id == account.id ) {
                    accounts.splice(i, 1);
                }
            }
            accounts.save($scope);
        };
        Yaba.models.txnCsvParsed($scope, institutions, accounts);
    }
    accounts.$inject = ['$scope', 'institutions', 'accounts'];
    Yaba.app.controller('accounts', accounts);

    /**
     * Account detail page.
     */
    function account($scope, $routeParams, institutions, accounts) {
        console.log('account-details()');
        $scope.account = accounts.findById($routeParams.accountId);
        Yaba.models.txnCsvParsed($scope, institutions, accounts);
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
        accounts.forEach(account => {
            account.transactions.forEach(txn => {
                $scope.transactions.push(txn);
            });
        });
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

        accounts.forEach(account => account.transactions.forEach(txn => $scope.transactions.push(txn)));
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

        institutionStorage.forEach(i => institutions.push(i));
        accountStorage.forEach(a => accounts.push(a));
        
        $rootScope.$on('save.institution', e => institutions.store(e));
        $rootScope.$on('save.institutions', e => institutions.store(e));

        $rootScope.$on('save.account', e => accounts.store(e));
        $rootScope.$on('save.accounts', e => accounts.store(e));

    }
    pageController.$inject = ['$rootScope', '$window', 'institutions', 'accounts'];
    Yaba.app.controller('page', pageController);

    /**
     * ###            Directive Controllers             ###
     */
    function InstitutionFormCtrl($scope, $timeout, institutions) {
        $scope.transactionFields = Yaba.models.TransactionFields;
        $scope.save = () => {
            if ( $scope.mode == 'add' ) {
                let fromUser = $scope.institution.toObject();
                institutions.push(fromUser);
            }
            institutions.save($scope);
            $scope.close();
        };

        $scope.remove = function remove($index) {
            $scope.institution.mappings[$index]._visible = false;
            $timeout(() => {
                $scope.institution.mappings.splice($index, 1);
            }, animationDelay);
        }

        $scope.close = function close() {
            $scope.institution.mappings.forEach(mapping => {
                mapping._visible = false;
            });
            $timeout(() => {
                $scope.seeForm = false;
                $timeout(() => { $scope.reset(); }, animationDelay);
            }, animationDelay / 2);
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
            if ( $scope.mode == 'add' ) {
                let fromUser = $scope.account.toObject();
                accounts.push(fromUser);
            }
            accounts.save($scope);
            $scope.close();
        };

        $scope.close = function close() {
            $scope.seeForm = false;
            $timeout($scope.reset, animationDelay);
        }

        $scope.reset = function reset() {
            $scope.account = new Yaba.models.Account();
        }
    }
    AccountFormCtrl.$inject = ['$scope', '$timeout', 'accounts'];
    Yaba.app.controller('yabaAccountCtrl', AccountFormCtrl);

    function BudgetCtrl($scope, accounts) {
        $scope.transactions = [];
        accounts.forEach(account =>
            account.transactions.forEach(txn =>
                $scope.transactions.push(txn)
            )
        );

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
    function TransactionListCtrl($scope, $attrs, accounts) {
        // By default, don't show tags. We can override this in the HTML include for this widget.
        $scope.includeTags = $attrs.hasOwnProperty('includeTags');
        $scope.withHeader = !$attrs.hasOwnProperty('withoutHeader');
        $scope.limit = $attrs.limit || 999;
        $scope.sortColumn = 'datePosted';

        $scope.sortBy = function sortBy(field) {
            $scope.sortColumn = field;
        }

        $scope.save = function save() {
            console.log('save-transaction()');
            accounts.save($scope);
        }
    }
    TransactionListCtrl.$inject = ['$scope', '$attrs', 'accounts'];
    Yaba.app.controller('yabaTransactionListCtrl', TransactionListCtrl);

    return Yaba;
})(Yaba);
