/**
 * Panel Page Controllers
 */
 (function(Yaba) {
    'use strict';

    const Ctrl = {};
    Yaba.hasOwnProperty('ctrl') || (Yaba.ctrl = Ctrl);

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
    function budget($scope) {
        console.info('Budget controller');
        $scope.budgets || ($scope.budgets = []);
    }
    budget.$inject = ['$scope'];
    Yaba.app.controller('budget', Ctrl.budget = budget);

    /**
     * Charts and Graphs of Budgets created.
     */
    function charts($scope, accounts, Settings, gCharts) {
        $scope.accounts = accounts;
        $scope.transactions = new Yaba.models.Transactions();

        $scope.rebalance = () => {
            $scope.transactions.clear();
            $scope.transactions.push(...accounts.getTransactions(
                $scope.selectedAccounts,
                $scope.fromDate,
                $scope.toDate,
                $scope.description,
                $scope.txnTags,
                -1
            ));
        };
        $scope.rebalance();
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
        $scope.prospect         = prospects;
        $scope.incomeTags       = Settings.incomeTags;
        $scope.expenseTags      = Settings.expenseTags;
        $scope.transferTags     = Settings.transferTags;
        $scope.hideTags         = Settings.hideTags;
        $scope.budgetBy         = Yaba.filters.budgetBy;
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
     * @property {Number} animationDelay How long the CSS is configured to animate stuff (in MS).
     */
    const animationDelay = 400;

    /**
     * New or Edit Institution form controller.
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

    /**
     * New and Edit Account Form Controller.
     */
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

    return Yaba;
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
     * Directed by the <yaba-controls /> Controller. By giving us the $fromDate, $toDate, $description,
     * $selectedAccounts and $txnTags, we can render back a list of transactions from the accounts we
     * have stored. Think of this as the eyeglassrootScope that gives you a view into the data that is the book
     * that contains the backend storage.
     * I am no longer trying to feed this control a list of transactions to render. It will render
     * what is provided by another control that will share its values and inputs from the user.
     * This TxnList Control will react accordingly to changes in directive updates from the end-user.
     * e.g. $rootScope.$broadcast() events.
     */
    function TransactionListCtrl($scope, $attrs, accounts) {
        $scope.includeTags      = $attrs.hasOwnProperty('includeTags');
        $scope.withHeader       = !$attrs.hasOwnProperty('withoutHeader');
        $scope.editable         = $attrs.hasOwnProperty('editable');
        $scope.limit || ($scope.limit = -1);
        $scope.save = () => { accounts.save($scope); };
        $scope.sortBy = Yaba.filters.sortBy($scope.sort || ($scope.sort = { column: 'datePosted', asc: true }));
        $scope.$watch('sort.column', () => $scope.$emit('yaba.txnList.resetScroll'));
        $scope.$watch('sort.asc',    () => $scope.$emit('yaba.txnList.resetScroll'));

        $scope.transactions     = new Yaba.models.Transactions();
        if ($scope.accountId !== undefined) {
            $scope.selectedAccounts = [accounts.byId($scope.accountId)];
        }
    }
    TransactionListCtrl.$inject = ['$scope', '$attrs', 'accounts'];
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
            $scope.$emit('yaba.txnList.resetScroll', $page);
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
     * Binds to $rootScope because it watches for changes and inputs from the user to broadcast to the
     * application.
     */
    function ControlsCtrl($rootScope, $scope, accounts, Settings) {
        $scope.accounts = accounts;
        $scope.transactionBudgets = accounts.getTags();
        $scope.useRegexp = false;

        $scope.fromDate = $scope.fromDate || new Date(new Date() - Settings.txnDelta);
        $scope.toDate = $scope.toDate || new Date();
        $scope.selectedAccounts = $scope.selectedAccounts || Object.assign([], accounts); // must be Array() or <select/> resets to 0.
        $scope.description = $scope.description || '';
        $scope.txnTags = $scope.txnTags || [];

        // I use $rootScope.$broadcast() here to signify changes from the user.
        // In this way, the user is broadcasting events into the app and we respond to those with the
        // local $scope.$on() events to consume them at the control.
        const controlsChange = () => $rootScope.$broadcast('controls.change');
        $scope.$watch('fromDate', controlsChange);
        $scope.$watch('toDate', controlsChange);
        $scope.$watch('selectedAccounts', controlsChange);
        $scope.$watch('description', controlsChange);
        $scope.$watch('txnTags', controlsChange);
        // I don't expect this will ever fire, but just in case...
        $scope.$on('yaba.txn-change', () => $scope.transactionBudgets = accounts.getTags());
    }
    ControlsCtrl.$inject = ['$rootScope', '$scope', 'accounts', 'Settings'];
    Yaba.app.controller('yabaControlsCtrl', Widgets.Controls = ControlsCtrl);

    function wishlist($scope) {
        $scope.wishlist = $scope.wishlist || new Yaba.models.Transactions();
        $scope.mode = $scope.mode || 'add';
        $scope.sortBy = Yaba.filters.sortBy($scope.sort || ($scope.sort = { column: 'datePosted', asc: true }));

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
     * Linker function for watching for changes in transactions to update what is rendered in the screen.
     */
    function transactionList(accounts) {
        return ($scope, $element, $attr) => {
            /**
             * Instead of iterating all the transactions every time, let's optimize by only iterating
             * the account if there is one set.
             */
            const update = () => {
                if ( $scope.accountId ) {
                    $scope.transactions = accounts.byId($scope.accountId).transactions.getTransactions(
                        $scope.fromDate,
                        $scope.toDate,
                        $scope.description,
                        $scope.txnTags,
                        $scope.limit
                    );
                } else {
                    $scope.transactions = accounts.getTransactions(
                        $scope.selectedAccounts,
                        $scope.fromDate,
                        $scope.toDate,
                        $scope.description,
                        $scope.txnTags,
                        $scope.limit
                    );
                }
                console.log('new.txns: ', $scope);
            };
            update();
            Yaba.$scope = $scope;

            $scope.$on('yaba.txn-change', update );
            $scope.$on('controls.change', update );
            $scope.$on('yaba.txnList.resetScroll', () => $element.find('table').scrollTop(0) );
        };
    }
    Links.transactionList = transactionList;

    /**
     * This linker function will control the budget widget and ensure it stays up to date when you pick
     * certain things from the user-controls.
     */
    function Budgets(accounts) {
        return ($scope, $element, $attr) => {
            const rebudget = () => {
                return $scope.budgets = accounts.getTransactions(
                    $scope.selectedAccounts,
                    $scope.fromDate,
                    $scope.toDate,
                    $scope.description,
                    $scope.txnTags,
                    -1
                ).getBudgets();
            }
            rebudget();
            $scope.$on('yaba.txn-change', rebudget);
        };
    }
    Links.Budgets = Budgets;

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
