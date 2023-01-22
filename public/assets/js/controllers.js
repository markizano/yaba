/**
 * Panel Page Controllers
 */
 (function(Yaba) {
    'use strict';

    const Ctrl = {};
    Yaba.hasOwnProperty('ctrl') || (Yaba.ctrl = Ctrl);

    /**
     * @property {Number} animationDelay How long the CSS is configured to animate stuff (in MS).
     */
    const animationDelay = 400;

    function pageController($rootScope, $scope, $window, institutions, accounts, prospects) {
        console.info('Loading and registering institutions and accounts...');
        $rootScope.DEBUG = $scope.DEBUG = Yaba.DEBUG;
        $scope.Year = (new Date()).getFullYear();
        let institutionStorage = JSON.parse($window.localStorage.getItem('institutions') || '[]'),
          accountStorage = JSON.parse($window.localStorage.getItem('accounts') || '[]'),
          prospectStorage = JSON.parse( localStorage.getItem('prospects') || '[]' );

        institutions.push(...institutionStorage);
        accounts.push(...accountStorage);
        prospects.push(...prospectStorage);

        $rootScope.$on('save.institution', e => institutions.store(e));
        $rootScope.$on('save.institutions', e => institutions.store(e));

        $rootScope.$on('save.account', e => accounts.store(e));
        $rootScope.$on('save.accounts', e => accounts.store(e));

        $rootScope.$on('save.prospects', e => prospects.store(e));

        $window.document.addEventListener('keydown', (e) => {
            // console.log(e.which);
            switch(e.which) {
                case 27: // Esc
                    $rootScope.$broadcast('popup.close');
                    break;
                case 39: // ArrowRight
                    if ( e.ctrlKey && e.shiftKey ) {
                        $rootScope.$broadcast('pagination.proximo', e);
                    }
                    break;
                case 37: // ArrowLeft
                    if ( e.ctrlKey && e.shiftKey ) {
                        $rootScope.$broadcast('pagination.previous', e);
                    }
                    break;
            }
        });
    }
    pageController.$inject = ['$rootScope', '$scope', '$window', 'institutions', 'accounts', 'prospects'];
    Yaba.app.controller('page', Ctrl.page = pageController);

    /**
     * Account Institutions Controller.
     */
    function institutions($scope, $timeout, institutions) {
        console.info('Yaba.controllers.institutions()');
        $scope.institutions = institutions;
        $scope.institution = new Yaba.models.Institution();
        $scope.seeForm = false;
        $scope.add = () => {
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
    Yaba.app.controller('institutions', Ctrl.institutions = institutions);

    /**
     * Angular Accounts controller.
     */
    function accounts($scope, institutions, accounts) {
        console.info('Yaba.controllers.accounts()');
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
        $scope.$on('popup.close', () => { $scope.seeForm = false; $scope.$apply(); });
        $scope.$on('csvParsed', Yaba.models.Transactions.csvHandler($scope, institutions, accounts));
    }
    accounts.$inject = ['$scope', 'institutions', 'accounts'];
    Yaba.app.controller('accounts', Ctrl.accounts = accounts);

    /**
     * Account detail page.
     */
    function account($scope, $routeParams, institutions, accounts) {
        console.info('account-details()');
        $scope.account = accounts.byId($routeParams.accountId);
        $scope.$on('csvParsed', Yaba.models.Transactions.csvHandler($scope, institutions, accounts));
    }
    account.$inject = ['$scope', '$routeParams', 'institutions', 'accounts'];
    Yaba.app.controller('account', Ctrl.account = account);

    /**
     * Angular Budget Controller.
     */
    function budget($scope, accounts) {
        console.info('Budget controller');
        $scope.budgets || ($scope.budgets = []);
        $scope.transactions || ($scope.transactions = new Yaba.models.Transactions());

        accounts.forEach(account => {
            $scope.transactions.push(...account.transactions);
        });
    }
    budget.$inject = ['$scope', 'accounts'];
    Yaba.app.controller('budget', Ctrl.budget = budget);

    /**
     * Charts and Graphs of Budgets created.
     */
    function charts($scope, accounts, Settings, gCharts) {
        $scope.accounts = accounts;
        $scope.transactions = new Yaba.models.Transactions();
        $scope.txnTags = [];
        $scope.fromDate = new Date(new Date() - Settings.txnDelta);
        $scope.toDate = new Date();

        $scope.rebalance = () => {
            $scope.transactions.clear();
            accounts.selected($scope.selectedAccounts).forEach(account => {
                $scope.transactions.push(...account.transactions
                    .daterange($scope.fromDate, $scope.toDate)
                    .byTags($scope.txnTags)
                );
            });
        };

        $scope.rebalance();
        $scope.$watch('fromDate', () => $scope.rebalance());
        $scope.$watch('toDate', () => $scope.rebalance());
        $scope.$watchCollection('txnTags', () => $scope.rebalance());
        $scope.$watchCollection('selectedAccounts', () => $scope.rebalance());

        const simpleDataTable = () => {
            const results = [ ['Date'].concat($scope.txnTags) ];
            let dataTable = {};
            $scope.transactions.sorted().map(txn => {
                dataTable.hasOwnProperty(txn.datePosted) || (dataTable[txn.datePosted] = {});
                txn.tags.filter(tag => $scope.txnTags.includes(tag)).forEach(tag => {
                    if ( dataTable[txn.datePosted].hasOwnProperty(tag) ) {
                        dataTable[txn.datePosted][tag] += txn.amount;
                    } else {
                        dataTable[txn.datePosted][tag] = txn.amount;
                    }
                });
                return dataTable;
            });
            results.push(...Object.keys(dataTable).map(date => {
                const tag2dataTable = tag => (dataTable[date][tag] || null);
                let dataPoint = [new Date(date)].concat($scope.txnTags.map(tag2dataTable));
                return dataPoint;
            }));
            return results;
        };
        $scope.budgets = simpleDataTable;
    }
    charts.$inject = ['$scope', 'accounts', 'Settings', 'gCharts'];
    Yaba.app.controller('charts', Ctrl.charts = charts);

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
    function Prospect($scope, accounts, prospects, Settings) {
        console.info('Prospect controller');
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

        $scope.prospect = $scope.prospect || prospects;
    }
    Prospect.$inject = ['$scope', 'accounts', 'prospects', 'Settings'];
    Yaba.app.controller('prospect', Ctrl.prospect = Prospect);

    /**
     * Edit/Manage App Settings.
     */
    function settings($scope, institutions, accounts, Settings) {
        $scope.settings = Settings;
        $scope.settings.load();

        // I gotta have at least some defaults set. I can't stand looking at a completely blank app...
        if ( !Settings.incomeTags ) {
            Settings.incomeTags = ['income'];
        }
        if ( !Settings.expenseTags ) {
            Settings.expenseTags = ['expense'];
        }
        if ( !Settings.transferTags ) {
            Settings.transferTags = ['transfer'];
        }
        if ( !Settings.hideTags ) {
            Settings.hideTags = ['hidden'];
        }

        $scope.deleteAll = () => {
            if ( (prompt('Enter YES to be sure to delete ALL data NOW: ') || '').toLowerCase() !== 'yes' ) {
                return false;
            }
            localStorage.clear();
            window.location.reload();
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
    Yaba.app.controller('settings', Ctrl.Settings = settings);
 })(Yaba);

/**
 * Form Controllers
 */
(function(Yaba) {
    const Forms = {};
    Yaba.hasOwnProperty('Forms') || (Yaba.Forms = Forms);

    /**
     * ###            Directive Controllers             ###
     */
    function InstitutionForm($scope, $timeout, institutions) {
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

        $scope.$on('popup.close', () => { $scope.close(); $scope.$apply(); });
        $scope.reset();
    }
    InstitutionForm.$inject = ['$scope', '$timeout', 'institutions'];
    Yaba.app.controller('yabaInstitutionCtrl', Forms.Institution = InstitutionForm);

    function AccountForm($scope, $timeout, accounts) {
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
    AccountForm.$inject = ['$scope', '$timeout', 'accounts'];
    Yaba.app.controller('yabaAccountCtrl', Forms.Account = AccountForm);

    /**
     * This controller uses an isolate scope, so we will need to reference the parent scope if we don't
     * want/need to bind the from-date, to-date and selected-accounts values.
     */
    function BudgetCtrl($rootScope, $scope) {
        let isBudgeting = false;
        function budgets() {
            let budgets = {};
            $scope.transactions.applyFilters(
                $scope.selectedAccounts,
                $scope.fromDate,
                $scope.toDate,
                $scope.description,
                $scope.txnTags,
                -1
            )
              .map(transaction => {
                return transaction.tags.map(tag => {
                    budgets.hasOwnProperty(tag) || (budgets[tag] = 0);
                    return { tag: tag, amount: transaction.amount };
                }).map(tagMap => {
                    return budgets[tagMap.tag] += tagMap.amount;
                });
            });
            $scope.budgets = [];
            for ( let b in budgets ) {
                $scope.budgets.push({budget: b, amount: budgets[b]});
            }
            return $scope.budgets;
        }
        budgets();
        $scope.updateBudgets = budgets;
        $rootScope.$on('yaba.txn-change', ($event) => {
            if ( isBudgeting ) {
                console.warn('another rebudget in progress. ignoring this event.');
                return;
            }
            budgets();
        });
    }
    BudgetCtrl.$inject = ['$rootScope', '$scope'];
    Yaba.app.controller('yabaBudgetCtrl', Forms.Budget = BudgetCtrl);

})(Yaba);

/**
 * Page Controls/Widgets Controllers
 */
(function(Yaba) {
    const Widgets = {};
    Yaba.hasOwnProperty('Widgets') || (Yaba.Widgets = Widgets);

    /**
     * Renders a collection of transactions. Controller for handling the list of transactions
     * and however we may want to render them.
     */
    function TransactionListCtrl($scope, $attrs, accounts, Settings) {
        // By default, don't show tags. We can override this in the HTML include for this widget.
        $scope.accounts         = accounts;
        $scope.includeTags      = $attrs.hasOwnProperty('includeTags');
        $scope.withHeader       = !$attrs.hasOwnProperty('withoutHeader');
        $scope.editable         = $attrs.hasOwnProperty('editable');

        ['showDaterange', 'showAccounts', 'showPagination', 'showDescription', 'showTags'].forEach(attr => {
            $scope[attr] = $attrs.hasOwnProperty(attr) && !!$attrs[attr];
        });

        $scope.limit || ($scope.limit = -1);

        const update = () => {
            $scope.transactions = $scope._transactions.applyFilters(
                $scope.showAccounts? $scope.selectedAccounts: undefined,
                $scope.showDaterange? $scope.fromDate: undefined,
                $scope.showDaterange? $scope.toDate: undefined,
                $scope.showDescription? $scope.description: undefined,
                $scope.showTags? $scope.txnTags: undefined,
                $scope.limit
            );
            console.log(`update.transactions(${$scope.transactions.length}, useDesc=${$scope.showDescription}, desc=${$scope.description})`);
        };
        update();

        $scope.sortBy = Yaba.filters.sortBy($scope.sort || ($scope.sort = { column: 'datePosted', asc: true }));

        $scope.save = () => { accounts.save($scope); };

        const forwardEvent = ($event) => {
            if ( $event && $event instanceof Event ) {
                $event.hasOwnProperty('preventDefault') && $event.preventDefault();
                $event.hasOwnProperty('stopPropagation') && $event.stopPropagation();
            }
            update();
            $scope.$emit('yaba.txn-change');
            return false;
        }
        if ( $scope.showDaterange ) {
            $scope.$on('date.change', forwardEvent);
        }
        if ( $scope.showAccounts ) {
            $scope.$watchCollection('selectedAccounts', forwardEvent);
        }
        if ( $scope.showDescription ) {
            $scope.$watch('description', () => { forwardEvent() } );
        }
        if ( $scope.showTags && $scope.txnTags ) {
            $scope.$watch('txnTags', forwardEvent);
        }
        if ( $scope.showPagination ) {
            $scope.$on('pagination.changed', () => { $attrs.$$element.find('table').scrollTop(0); });
        }
        $scope.$watchCollection('_transactions', forwardEvent);
        $scope.$watchCollection('transactions', forwardEvent);
    }
    TransactionListCtrl.$inject = ['$scope', '$attrs', 'accounts', 'Settings'];
    Yaba.app.controller('yabaTransactionListCtrl', Widgets.TransactionList = TransactionListCtrl);

    /**
     * Pagination Controller. Ensures we stay on the right page by keeping track of where we are in displaying
     * results of a large array of data.
     */
    function PaginationCtrl($scope) {
        $scope.itemsPerPage || ($scope.itemsPerPage = 100);
        $scope.offset = 0;
        $scope.page = 0;
        $scope.setPage = ($page) => {
            if ( $page < 0 || $page > $scope.pageCount -1 ) return;
            $scope.page = $page;
            $scope.offset = $page * $scope.itemsPerPage;
            $scope.$emit('pagination.changed', $page);
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
    Yaba.app.controller('yabaPagination', Widgets.Pagination = PaginationCtrl);

    /**
     * Handles The Controls at the top of the transactions list for:
     * - Daterange ($fromDate, $toDate)
     * - Selected Account(s) ($selectedAccounts)
     * - Description ($description) for txns matching this for any of their text fields.
     * - Tags ($txnTags) list of budgets selected that should match these tags.
     */
    function ControlsCtrl($scope, accounts, Settings) {
        $scope.accounts = accounts;
        $scope.fromDate = new Date(new Date() - Settings.txnDelta);
        $scope.toDate = new Date();
        $scope.selectedAccounts = Object.assign([], accounts);
        $scope.description = '';
        $scope.useRegEx = false;
        $scope.transactionBudgets = [];
        $scope.txnTags = [];
        $scope.$watch('selectedAccounts', () => {
            $scope.transactionBudgets.length = 0;
            accounts.selected($scope.selectedAccounts).forEach(account => {
                account.transactions.map(txn => {
                    txn.tags.forEach(tag => {
                        $scope.transactionBudgets.includes(tag) || $scope.transactionBudgets.push(tag);
                    });
                });
            });
        });
    }
    ControlsCtrl.$inject = ['$scope', 'accounts', 'Settings'];
    Yaba.app.controller('yabaControlsCtrl', Widgets.Controls = ControlsCtrl);

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
            console.info(`Removing wishlist(${$index})`);
            $scope.wishlist.splice($index, 1);
            $scope.$emit('save.prospects');
        };

        $scope.edit = ($index) => {
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
    Yaba.app.controller('yabaWishlist', Widgets.Wishlist = wishlist);
})(Yaba);

/**
 * Linker functions that aren't really controllers, but we still need for defining directives.
 */
(function(Yaba) {
    const Links = {};
    Yaba.hasOwnProperty('Links') || (Yaba.Links = Links);

    /**
     * Enables one to include class="csvdrop" as an attribute and it'll attach this event that will
     * handle dragging a file into the element.
     */
    function csvdrop($scope, $element, $attr) {
        function highlight(event) {
            if ( event ) {
                event.preventDefault();
            }
            $element.addClass('dragging');
            return false;
        }

        function unlight(event) {
            if ( event ) {
                event.preventDefault();
            }
            $element.removeClass('dragging');
            return false;
        }

        function parseError(event) {
            return (err, file, element, reason) => {
                console.error(`Papa.parse() error from ${file} in ${element}: ${err}`);
                console.error(reason);
                // @TODO: Find a way to notify the end-user of a failure.
                $scope.emit('csvError', {
                    err,
                    file,
                    element,
                    reason,
                    institutionId: event.institutionId,
                    accountId: event.accountId
                });
            };
        }

        function done(event) {
            return (parsedCSV) => {
                let result = {
                    parsedCSV,
                    institutionId: event.institutionId,
                    accountId: event.accountId
                };
                $scope.$emit('csvParsed', result);
            };
        }

        function drop(event) {
            if ( event ) { event.preventDefault(); }
            unlight(event);
            if ( $scope.account ) {
                event.institutionId = $scope.account.institutionId || '';
                event.accountId = $scope.account.id || '';
            }
            angular.forEach(event.originalEvent.dataTransfer.files, (uploadFile) => {
                Papa.parse(uploadFile, {
                    header: true,
                    skipEmptyLines: true,
                    error: parseError(event),
                    complete: done(event)
                });
            });
        }

        $element.bind('dragover', highlight);
        $element.bind('dragenter', highlight);
        $element.bind('dragleave', unlight);
        $element.bind('dragend', unlight);
        $element.bind('drop', drop);
    }
    Links.csvdrop = csvdrop;
})(Yaba);