/**
 * AngularJS Controllers
 */
 (function(Yaba) {
    'use strict';

    /**
     * @property {number} ms30days 30 days in milliseconds
     */
    const ms30days = 2592000000; // 1000ms * 60s * 60m * 24h * 30d
    const ms90days = 7776000000; // 1000ms * 60s * 60m * 24h * 90d

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
        $scope.$on('csvParsed', Yaba.models.Institutions.csvHandler($scope, $timeout));
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
        $scope.$on('csvParsed', Yaba.models.Transactions.csvHandler($scope, institutions, accounts));
    }
    accounts.$inject = ['$scope', 'institutions', 'accounts'];
    Yaba.app.controller('accounts', accounts);

    /**
     * Account detail page.
     */
    function account($scope, $routeParams, institutions, accounts) {
        console.log('account-details()');
        $scope.fromDate = new Date(new Date() - (ms90days * 8));
        $scope.account = accounts.byId($routeParams.accountId);
        $scope.$on('csvParsed', Yaba.models.Transactions.csvHandler($scope, institutions, accounts));
    }
    account.$inject = ['$scope', '$routeParams', 'institutions', 'accounts'];
    Yaba.app.controller('account', account);

    /**
     * Angular Budget Controller.
     */
    function budget($scope, accounts) {
        console.log('Budget controller');
        $scope.startDate || ($scope.startDate = new Date( Date.now() - ms30days ));
        $scope.endDate || ($scope.endDate = new Date());
        $scope.budgets || ($scope.budgets = []);
        $scope.accounts || ($scope.accounts = accounts);
        $scope.transactions || ($scope.transactions = new Yaba.models.Transactions());
        accounts.forEach(account => {
            $scope.transactions.push(...account.transactions);
        });
    }
    budget.$inject = ['$scope', 'accounts'];
    Yaba.app.controller('budget', budget);

    /**
     * Charts and Graphs of Budgets created.
     */
    function charts($scope, accounts) {
        $scope.transactions = new Yaba.models.Transactions();
        $scope.selectedAccounts = new Yaba.models.Accounts();
        $scope.fromDate = new Date(new Date() - (ms90days * 8));
        $scope.toDate = new Date();
        $scope.accounts = accounts;
        $scope.transactionBudgets = [];
        $scope.txnTags = [];

        $scope.rebalance = () => {
            transactionBudgets();
            $scope.transactions.clear();
            let selectedAccounts = accounts.selected($scope.selectedAccounts);
            selectedAccounts.forEach(account => {
                $scope.transactions.push(...account.transactions
                    .daterange($scope.fromDate, $scope.toDate)
                    .byTags($scope.txnTags)
                );
            });
        };

        const transactionBudgets = () => {
            $scope.transactionBudgets.length = 0;
            accounts.selected($scope.selectedAccounts).forEach(account => {
                account.transactions.daterange($scope.fromDate, $scope.toDate).forEach(txn => {
                    txn.tags.forEach(tag => {
                        if ( !$scope.transactionBudgets.includes(tag) ) {
                            $scope.transactionBudgets.push(tag);
                        }
                    });
                });
            });
            return $scope.transactionBudgets;
        };

        $scope.rebalance();
        $scope.$watch('fromDate', () => $scope.rebalance());
        $scope.$watch('toDate', () => $scope.rebalance());
        $scope.$watchCollection('txnTags', () => $scope.rebalance());
        $scope.$watchCollection('selectedAccounts', () => $scope.rebalance());

        $scope.budgets = () => {
            var results = [ ['Date'].concat($scope.txnTags) ];
            $scope.transactions.forEach((transaction) => {
                let dataPoint = [transaction.datePosted];
                for ( let i = 0; i < $scope.txnTags.length; i++ ) {
                    if ( transaction.tags.includes($scope.txnTags[i]) ) {
                        dataPoint.push(transaction.amount);
                    } else {
                        dataPoint.push(null);
                    }
                }
                results.push(dataPoint);
            });
            return results;
        }

        // DEBUG
        Yaba.debug = $scope;
    }
    charts.$inject = ['$scope', 'accounts'];
    Yaba.app.controller('charts', charts);

    /**
     * Prospect what will happen to my paycheque or income each cycle with the amount of 
     * expenses I have.
     * Take the amount of expenses I have for the pay cycle and subtract them from the income for
     * the pay cycle. Next, deduct extra expenses since then.
     * From that, render the box and all the stuff we want to buy when it's configured to have
     * been purchased.
     * In the resulting box, show the remaining amount to be paid based on the previous cycle's
     * income.
     */
    function prospect($scope, accounts, Settings) {
        console.log('Prospect controller');
        // Rename the constructor to save under a different name.
        function updateBudgets(value) {
            $scope.incomeTxns = $scope.transactions.byTags($scope.incomeTags);
            $scope.expenseTxns = $scope.transactions.byTags($scope.expenseTags);
        }
        $scope.transactions     = $scope.transactions   || new Yaba.models.Transactions();
        $scope.incomeTxns       = $scope.incomeTxns     || new Yaba.models.Transactions();
        $scope.expenseTxns      = $scope.expenseTxns    || new Yaba.models.Transactions();
        $scope.incomeTags       = Settings.incomeTags;
        $scope.expenseTags      = Settings.expenseTags;
        $scope.transferTags     = Settings.transferTags;
        $scope.hideTags         = Settings.hideTags;
        $scope.payCycle         = Settings.payCycle;
        $scope.budgetBy         = Yaba.filters.budgetBy;

        accounts.forEach(account => $scope.transactions.push(...account.transactions));
        $scope.$watchCollection('transactions', updateBudgets);
        updateBudgets();

        class Prospects extends Yaba.models.Transactions {};
        $scope.prospect = $scope.prospect || new Prospects();
        $scope.$on('save.prospects', () => {
            $scope.prospect.store();
        });

        if ( localStorage.prospects ) {
            console.log('Found saved prospects!');
            let prospects = JSON.parse( localStorage.getItem('prospects') || '[]' );
            $scope.prospect.push(...prospects);
        }
    }
    prospect.$inject = ['$scope', 'accounts', 'Settings'];
    Yaba.app.controller('prospect', prospect);

    /**
     * Edit/Manage App Settings.
     */
    function settings($scope, institutions, accounts, Settings) {
        $scope.settings = Settings;
        $scope.settings.load();

        $scope.deleteAll = () => {
            localStorage.clear();
            $scope.$emit('notify', 'Cleared ALL local data.');
        }

        $scope.export2zip = () => {
            let exportZIP = new JSZip();
            institutions.toCSV(exportZIP);
            accounts.toCSV(exportZIP);

            exportZIP.generateAsync({ type: "blob" })
            .then(content => {
                // see FileSaver.js
                let d = new Date();
                saveAs(content, `yaba-export-${d.toISOShortDate()}.zip`);
            });
        };

        $scope.import4zip = () => {
            console.warn('To be implemented...');
        }
    }
    settings.$inject = ['$scope', 'institutions', 'accounts', 'Settings'];
    Yaba.app.controller('settings', settings);

    function pageController($rootScope, $window, institutions, accounts) {
        console.log('Loading and registering institutions and accounts...');
        let institutionStorage = JSON.parse($window.localStorage.getItem('institutions') || '[]'),
        accountStorage = JSON.parse($window.localStorage.getItem('accounts') || '[]');

        institutions.push(...institutionStorage);
        accounts.push(...accountStorage);

        $rootScope.$on('save.institution', e => institutions.store(e));
        $rootScope.$on('save.institutions', e => institutions.store(e));

        $rootScope.$on('save.account', e => accounts.store(e));
        $rootScope.$on('save.accounts', e => accounts.store(e));

        $window.document.addEventListener('keydown', (e) => {
            switch(e.which) {
                case 39: // ArrowRight
                    if ( e.ctrlKey ) {
                        $rootScope.$broadcast('pagination.proximo', e);
                    }
                    break;
                case 37: // ArrowLeft
                    if ( e.ctrlKey ) {
                        $rootScope.$broadcast('pagination.previous', e);
                    }
                    break;
            }
        });
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
        $scope.transactions = new Yaba.models.Transactions();
        accounts.forEach(account => {
            let transactions = new Yaba.models.Transactions();
            transactions.push(...account.transactions);
            if ( $scope.fromDate && $scope.toDate ) {
                transactions = transactions.daterange($scope.fromDate, $scope.toDate);
            }
            if ( $scope.accountIds ) {
                transactions = transactions.byAccountIds($scope.accountIds);
            }
            $scope.transactions.push(...transactions);
        });

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
        $scope.accounts         = accounts;
        $scope.includeTags      = $attrs.hasOwnProperty('includeTags');
        $scope.withHeader       = !$attrs.hasOwnProperty('withoutHeader');
        $scope.showAccounts     = $attrs.hasOwnProperty('showAccounts');
        $scope.showDaterange    = $attrs.hasOwnProperty('showDaterange');
        $scope.showPagination   = $attrs.hasOwnProperty('showPagination');
        $scope.editable         = $attrs.hasOwnProperty('editable');

        $scope.itemsPerPage || ($scope.itemsPerPage = $attrs.limit || ($scope.showPagination? 10: 999));
        $scope.offset || ($scope.offset = 0);
        $scope.fromDate = $scope.fromDate || new Date(new Date() - ms90days);
        $scope.toDate = $scope.toDate || new Date();

        $scope.transactions = $scope.showDaterange?
          $scope._transactions.daterange($scope.fromDate, $scope.toDate)
          : $scope._transactions;

        $scope.sortBy = Yaba.filters.sortBy($scope.sort || ($scope.sort = { column: 'datePosted', asc: true }));

        $scope.save = () => {
            accounts.save($scope);
        };
        $scope.$on('date.change', ($event) => {
            $scope.transactions = $scope._transactions.daterange($scope.fromDate, $scope.toDate);
        });
    }
    TransactionListCtrl.$inject = ['$scope', '$attrs', 'accounts'];
    Yaba.app.controller('yabaTransactionListCtrl', TransactionListCtrl);

    /**
     * Pagination Controller. Ensures we stay on the right page by keeping track of where we are in displaying
     * results of a large array of data.
     */
    function PaginationCtrl($scope) {
        $scope.itemsPerPage || ($scope.itemsPerPage = 10);
        $scope.offset = 0;
        $scope.page = 0;
        $scope.setPage = ($page) => {
            if ( $page < 0 || $page > $scope.pageCount -1 ) return;
            $scope.page = $page;
            $scope.offset = $page * $scope.itemsPerPage;
        };
        $scope.previous = () => $scope.setPage($scope.page -1);
        $scope.proximo = () => $scope.setPage($scope.page +1);
        $scope.refresh = () => {
            $scope.pageCount = Math.round( $scope.itemCount / $scope.itemsPerPage );
            if ( $scope.itemCount >= $scope.itemsPerPage ) {
                $scope.pageCount += 1;
            }
            $scope.setPage(0);
        }
        $scope.keyNavigate = ($event) => {
            // Right
            if ( $event.which == 39 ) {
                $event.preventDefault();
                $scope.proximo();
            // Left
            } else if ( $event.which == 37 ) {
                $event.preventDefault();
                $scope.previous();
            }
        };
        $scope.refresh();
        $scope.$watch('itemCount', () => $scope.refresh() );
        $scope.$on('pagination.previous', ($event, jqEvent) => {
            $scope.previous();
            $scope.$apply();
        });
        $scope.$on('pagination.proximo', ($event, jqEvent) => {
            $scope.proximo();
            $scope.$apply();
        });
    }
    PaginationCtrl.$inject = ['$scope'];
    Yaba.app.controller('yabaPagination', PaginationCtrl);

    function wishlist($scope) {
        $scope.wishlist = $scope.wishlist || new Yaba.models.Transactions();
        $scope.mode = $scope.mode || 'add';

        $scope.add = () => {
            $scope.wishlist.push({
                amount: $scope.amount,
                datePosted: new Date($scope.datePurchase),
                description: $scope.description
            });
            $scope.$emit('save.prospects');
        };

        $scope.remove = ($index) => {
            console.log(`Removing wishlist(${$index})`);
            $scope.wishlist.splice($index, 1);
            $scope.$emit('save.prospects');
        };

        $scope.edit = ($index) => {
            console.log(`edit(${$index})`, $scope);
            $scope.datePurchase = $scope.wishlist[$index].datePosted;
            $scope.amount = $scope.wishlist[$index].amount;
            $scope.description = $scope.wishlist[$index].description;
            $scope.index = $index;
            $scope.mode = 'edit';
        };

        $scope.cancel = () => {
            $scope.description = '';
            $scope.datePurchase = Yaba.models.DATENULL;
            $scope.amount = null;
            $scope.mode = 'add';
        }
        $scope.save = () => {
            const w = $scope.wishlist[$scope.index];
            w.datePosted = $scope.datePurchase;
            w.amount = $scope.amount;
            w.description = $scope.description;
            $scope.cancel(); // cancel() acts a lot like reset();
            $scope.$emit('save.prospects');
        }

        $scope.sortBy = Yaba.filters.sortBy($scope.sort || ($scope.sort = { column: 'datePosted', asc: true }));
    }
    wishlist.$inject = ['$scope'];
    Yaba.app.controller('yabaWishlist', wishlist);

    return Yaba;
})(Yaba);
