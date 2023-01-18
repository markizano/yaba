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
        $scope.$on('popup.close', () => { $scope.seeForm = false; $scope.$apply(); });
        $scope.$on('csvParsed', Yaba.models.Transactions.csvHandler($scope, institutions, accounts));
    }
    accounts.$inject = ['$scope', 'institutions', 'accounts'];
    Yaba.app.controller('accounts', accounts);

    /**
     * Account detail page.
     */
    function account($scope, $routeParams, institutions, accounts) {
        console.log('account-details()');
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
        $scope.budgets || ($scope.budgets = []);
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
    function charts($scope, accounts, Settings, gCharts) {
        $scope.transactions = new Yaba.models.Transactions();
        $scope.selectedAccounts = new Yaba.models.Accounts();
        $scope.accounts = accounts;
        $scope.transactionBudgets = [];
        $scope.txnTags = [];
        $scope.fromDate = new Date(new Date() - Settings.txnDelta);
        $scope.toDate = new Date();

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

        const simpleDataTable = () => {
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
        };
        $scope.budgets = simpleDataTable;
    }
    charts.$inject = ['$scope', 'accounts', 'Settings', 'gCharts'];
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

        $scope.prospect = $scope.prospect || new Yaba.models.Prospects();
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
    Yaba.app.controller('settings', settings);

    function pageController($rootScope, $scope, $window, institutions, accounts) {
        console.log('Loading and registering institutions and accounts...');
        $rootScope.DEBUG = $scope.DEBUG = Yaba.DEBUG;
        $scope.Year = (new Date()).getFullYear();
        let institutionStorage = JSON.parse($window.localStorage.getItem('institutions') || '[]'),
        accountStorage = JSON.parse($window.localStorage.getItem('accounts') || '[]');

        institutions.push(...institutionStorage);
        accounts.push(...accountStorage);

        $rootScope.$on('save.institution', e => institutions.store(e));
        $rootScope.$on('save.institutions', e => institutions.store(e));

        $rootScope.$on('save.account', e => accounts.store(e));
        $rootScope.$on('save.accounts', e => accounts.store(e));

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
    pageController.$inject = ['$rootScope', '$scope', '$window', 'institutions', 'accounts'];
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

        $scope.$on('popup.close', () => { $scope.close(); $scope.$apply(); });
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

    /**
     * This controller uses an isolate scope, so we will need to reference the parent scope if we don't
     * want/need to bind the from-date, to-date and selected-accounts values.
     */
    function BudgetCtrl($rootScope, $scope) {
        let isBudgeting = false;
        function budgets() {
            let budgets = {};
            $scope.transactions.applyFilters($scope.selectedAccounts, $scope.fromDate, $scope.toDate, -1)
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
    Yaba.app.controller('yabaBudgetCtrl', BudgetCtrl);

    /**
     * Renders a collection of transactions. Controller for handling the list of transactions
     * and however we may want to render them.
     */
    function TransactionListCtrl($scope, $attrs, accounts, Settings) {
        // By default, don't show tags. We can override this in the HTML include for this widget.
        $scope.accounts         = accounts;
        $scope.includeTags      = $attrs.hasOwnProperty('includeTags');
        $scope.withHeader       = !$attrs.hasOwnProperty('withoutHeader');
        $scope.showAccounts     = $attrs.hasOwnProperty('showAccounts');
        $scope.showDaterange    = $attrs.hasOwnProperty('showDaterange');
        $scope.showPagination   = $attrs.hasOwnProperty('showPagination');
        $scope.editable         = $attrs.hasOwnProperty('editable');

        $scope.itemsPerPage     || ($scope.itemsPerPage = 10);
        $scope.offset           || ($scope.offset       = 0);
        $scope.limit            || ($scope.limit        = -1);

        $scope.selectedAccounts || ($scope.selectedAccounts = Object.assign([], accounts));
        $scope.fromDate         || ($scope.fromDate         = new Date(new Date() - Settings.txnDelta));
        $scope.toDate           || ($scope.toDate           = new Date());

        const update = () => {
            $scope.transactions = $scope._transactions.applyFilters(
                $scope.showAccounts? $scope.selectedAccounts: undefined,
                $scope.showDaterange? $scope.fromDate: undefined,
                $scope.showDaterange? $scope.toDate: undefined,
                $scope.limit
            );
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
        $scope.$watchCollection('_transactions', forwardEvent);
        $scope.$watchCollection('transactions', forwardEvent);
    }
    TransactionListCtrl.$inject = ['$scope', '$attrs', 'accounts', 'Settings'];
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

    function develop($scope, institutions, accounts, Settings) {
        class RandomArray extends Array {
            random() {
                return this[Math.floor(Math.random() * this.length)];
            }
        }
        const seedlist = {};
        seedlist.number = (upper=100, dec=2) => {
            // Gimmie a random number no greater than ${upper} as float() with ${dec} number of decimal places.
            const decimals = (value, index) => index? value.slice(0, dec): value;
            return Number((Math.random() * upper).toString().split('.').map(decimals).join('.'));
        }
        seedlist.institutions = new RandomArray(
            {name: 'JPMC', description: 'JP Morgan Chase'},
            {name: 'BoA', description: 'Bank of America'},
            {name: 'WF', description: 'Wells Fargo'},
            {name: 'Synchrony', description: 'Synchrony Bank'},
            {name: 'CapOne', description: 'Capital One'},
            {name: 'Fidelity', description: 'Fidelity Checking'},
            {name: 'AmEx', description: 'American Express'},
            {name: '', description: ''},
        );
        seedlist.merchants = new RandomArray(
            'Macys', 'Dillards', 'Banana Republic', 'Gap', 'Old Navy', 'JC Pennys',
            'Nordstrom', 'Nordstrom Rack',
            'Target', 'Walmart', 'Kroger', 'Tom Thumb', 'King Soopers', 'WinnCo Foods',
            'Dollar Tree', 'Dollar General', '99 cent store',
            'Ace Hardware', 'Toms Mechanics',
            'Toyota', 'Honda', 'Chevy', 'RAM', 'Loves', 'Race Track', 'Raceway',
            '7-Eleven', 'Valero', 'BP: Better Petroleum', 'Shell Gas', 'Robinhood'
        );
        seedlist.products = new RandomArray(
            '2% Milk', 'Whole Milk', 'Half and Half', 'Heavy Whipping Cream',
            'Eggs', 'Cheese', 'Lunchmeat', 'Bread', 'Coffee', 'Ice Cream', 'Chips',
            'Pickles', 'Olives', 'Oil change', 'Brake Check', 'Tire Rotation', 'Fleece Shirt',
            'Barbie Doll', 'Ken Doll', `Action Figure #${seedlist.number(10, 0)}`,
            'Sausage', 'Bacon', 'Ham', 'Onion', 'Celery', 'Jeans',
            'Credit Card Payments', 'Tax Returns', 'Tax Payments', 'Insurance',
            'Mortgage', 'Interest'
        );
        seedlist.income = new RandomArray('Payroll', 'Income', 'Tips', 'Gifts', 'Sales', 'Dividends', 'Tax Returns');
        seedlist.transactionTypes = new RandomArray('withdraw', 'deposit');
        seedlist.headerTypes = {
            datePending: new RandomArray('Requested Date', 'Date Pending', 'Pending Date', 'Pending'),
            datePosted: new RandomArray('Transaction Date', 'Txn Date', 'Date Posted', 'Posted Date', 'Posted'),
            amount: new RandomArray('Amount', 'amount', 'Cost', 'Debit', 'Credit'),
            description: new RandomArray('Description', 'description', 'Memo', 'Remarks'),
        };
        seedlist.accountTypes = new RandomArray(...Object.values(Yaba.models.Account.Types));
        seedlist.genInstitution = () => {
            let name, description;
            ((i) => { name = i.name; description = i.description })(seedlist.institutions.random());
            let mappings = [];
            mappings.push({
                fromField: seedlist.headerTypes.datePending.random(),
                toField: 'datePending',
                mapType: 'dynamic'
            });
            mappings.push({
                fromField: seedlist.headerTypes.datePosted.random(),
                toField: 'datePosted',
                mapType: 'dynamic'
            });
            mappings.push({
                fromField: seedlist.headerTypes.amount.random(),
                toField: 'amount',
                mapType: 'dynamic'
            });
            mappings.push({
                fromField: seedlist.headerTypes.description.random(),
                toField: 'description',
                mapType: 'dynamic'
            });
            mappings.push({
                fromField: 'USD',
                toField: 'currency',
                mapType: 'static'
            });
            return new Yaba.models.Institution({name, description, mappings});
        };
        seedlist.genAccount = (institutionId=null) => {
            let name, description;
            ((i) => { name = i.name; description = i.description })(seedlist.institutions.random());
            return new Yaba.models.Account({
                id: uuid.v4(),
                institutionId: institutionId,
                name: name,
                description: description,
                accountType: seedlist.accountTypes.random(),
                number: Math.floor(Math.random() * 999999999),
                routing: Math.floor(Math.random() * 99999999),
                interestRate: seedlist.number(5, 2),
                interestStrategy: 'simple',
            });
        };
        seedlist.genTransaction = (accountId=null) => {
            console.log(`Gen txn with ${accountId}.`);
            let ttype = seedlist.transactionTypes.random(),
              institution = seedlist.institutions.random(),
              amount = seedlist.number(),
              datePosted = new Date(new Date() - Math.floor(Math.random() * 365 * 1000 * 3600 * 24)),
              datePending = new Date(datePosted - (3 * 1000 * 3600 * 24));
            switch(ttype) {
                case 'withdraw':
                    let merchant = seedlist.merchants.random();
                    return new Yaba.models.Transaction({
                        id: uuid.v4(),
                        description: `${seedlist.products.random()} at ${merchant}`,
                        accountId: accountId,
                        datePending: datePending,
                        datePosted: datePosted,
                        transactionType: ttype,
                        amount: -amount,
                        tax: amount * 0.09,
                        currency: 'USDC',
                        merchant: merchant,
                        tags: [],
                    });
                case 'deposit':
                    return new Yaba.models.Transaction({
                        id: uuid.v4(),
                        description: `${seedlist.income.random()} at ${institution.description}`,
                        accountId: accountId,
                        datePending: datePending,
                        datePosted: datePosted,
                        transactionType: ttype,
                        amount: amount,
                        tax: 0,
                        currency: 'USDC',
                        merchant: institution.description,
                        tags: [],
                    });
            }
        };
        Yaba.seedlist = seedlist;
        $scope.genInstitution = () => {
            $scope.institution = seedlist.genInstitution();
        };
        $scope.genAccount = (institutionId=null) => {
            $scope.account = seedlist.genAccount(institutionId);
        };
        $scope.genTransaction = (accountId=null) => {
            $scope.transaction = seedlist.genTransaction(accountId);
        };
        $scope.institutions = institutions;
        $scope.accounts = accounts;
        $scope.produceCSV = (txnCount=10) => {
            let csvFile = '';
            const map2string = (t) => (m) => t[m.toField] instanceof Date? t[m.toField].toISOShortDate(): t[m.toField];
            let institution = seedlist.genInstitution();
            let account = seedlist.genAccount(institution.id);
            let mapFields = institution.mappings.filter(m => m.mapType == 'dynamic');
            for ( let i=0; i <= txnCount; i++ ) {
                account.transactions.push(seedlist.genTransaction(account.id));
            }
            account.transactions.sort((a, b) => b.datePosted - a.datePosted);
            csvFile = '"' + mapFields.map(m => m.fromField).join('","') + '"\n"'
              + account.transactions
                .map(t => mapFields.map(map2string(t))
                .join('","') )
                .join('"\n"') + '"';
            $scope.csvfile = csvFile;
            const csvBlob = new Blob([csvFile], { type: 'text/csv' } );
            saveAs(csvBlob, 'mock-transactions.csv');
        }
    }
    develop.$inject = ['$scope', 'institutions', 'accounts', 'Settings'];
    Yaba.app.controller('develop', develop);

    return Yaba;
})(Yaba);
