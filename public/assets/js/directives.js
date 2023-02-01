(function(Yaba){

    /**
     * Institution Form Directive. Allows us to have a form that collects mappings for institutions
     * and create new entries.
     */
    Yaba.app.directive('yabaInstitutionForm', () => {
        return {
            templateUrl: '/assets/views/forms/institution.htm',
            controller: 'yabaInstitutionCtrl',
            scope: {
                institution: '=',
                seeForm: '=',
                mode: '='
            },
            restrict: 'E'
        };
    });

    /**
     * Account form lets us collect information about accounts and types of accounts to track informations.
     */
    Yaba.app.directive('yabaAccountForm', (() => {
        return {
            templateUrl: '/assets/views/forms/account.htm',
            controller: 'yabaAccountCtrl',
            scope: {
                account: '=',
                seeForm: '=',
                mode: '='
            },
            restrict: 'E'
        };
    }));

    /**
     * Budget widget to show us our budgets as we tag our transactions.
     */
    Yaba.app.directive('yabaBudget', (accounts) => {
        return {
            templateUrl: '/assets/views/tables/budget.htm',
            scope: {
                budget: '=',
                transactions: '=',
                selectedAccounts: '=',
                fromDate: '=',
                toDate: '=',
            },
            link: Yaba.Links.Budgets(accounts),
            restrict: 'AE'
        };
    });

    /**
     * Small daterange directive to show us 2 date fields bound by $fromDate and $toDate.
     */
    Yaba.app.directive('yabaDaterange', () => {
        return {
            templateUrl: '/assets/views/daterange.htm',
            restrict: 'E',
            scope: {
                fromDate: '=',
                toDate: '='
            }
        }
    });

    /**
     * User controls that will tell this app what range of data we want to view in the display.
     */
    Yaba.app.directive('yabaControls', () => {
        return {
            require: ['yabDaterange'],
            templateUrl: '/assets/views/controls.htm',
            restrict: 'E',
            controller: 'yabaControlsCtrl',
            scope: {
                fromDate: '=?',
                toDate: '=?',
                selectedAccounts: '=?',
                description: '=?',
                txnTags: '=?',
                showDaterange: '=?',
                showDescription: '=?',
                showAccounts: '=?',
                showTags: '=?',
            }
        }
    });

    /**
     * Pagination control that will render our results in a paginated way so we can see what's
     * where.
     */
    Yaba.app.directive('yabaPagination', () => {
        return {
            templateUrl: '/assets/views/pagination.htm',
            restrict: 'E',
            controller: 'yabaPagination',
            scope: {
                'itemCount': '=',
                'itemsPerPage': '=',
                'offset': '='
            }
        }
    });

    /**
     * txn-edit/Transaction Editor: Enable the ability to edit a field given this as an attribute.
     * Requires 2 children elements: view and edit as HTML child objects to the holder of this attribute.
     * The 0th element will be the view. It will bind to the desired ng-model connected to this control.
     * The 1st element will be the edit input where we accept user input as per the field data type this
     *   element controls.
     * This will attach an `actively-editing` class to the elements when they are currently being edited.
     * This allows for custom controlling the way it would be rendered with CSS and transitions.
     */
    Yaba.app.directive('txnEdit', ($rootScope, $timeout) => {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: Yaba.models.Transactions.txnTable($rootScope, $timeout)
        }
    });

    /**
     * Complicated structure made simple to render transactions in a table listing.
     */
    Yaba.app.directive('yabaTransactionList', (accounts) => {
        return {
            // require: ['yabaControls', 'yabaPagination', 'txnEdit'],
            templateUrl: '/assets/views/tables/transactions.htm',
            controller: 'yabaTransactionListCtrl',
            link: Yaba.Links.transactionList(accounts),
            scope: {
                accountId: '=?',
                fromDate: '=?',
                toDate: '=?',
                selectedAccounts: '=?',
                description: '=?',
                txnTags: '=?',
                limit: '=?'
            },
            restrict: 'E'
        };
    });

    /**
     * Wishlist widget to let us control items on our wishlist to buy stuff.
     */
    Yaba.app.directive('yabaWishlist', () => {
        return {
            templateUrl: '/assets/views/prospect/wishlist.htm',
            controller: 'yabaWishlist',
            scope: {
                wishlist: '='
            },
            restrict: 'E'
        };
    });

    /**
     * Wishlist widget to let us control items on our wishlist to buy stuff.
     */
    Yaba.app.directive('yabaTxnStats', () => {
        return {
            require: 'ngModel',
            templateUrl: '/assets/views/prospect/txn-stats.htm',
            scope: {
                transactions: '='
            },
            restrict: 'E'
        };
    });

    /**
     * Makes elements available to accept CSV files for drag-and-drop operations.
     */
    Yaba.app.directive('csvdrop', () => {
        return {
            link: Yaba.Links.csvdrop,
            restrict: 'AC'
        }
    })

    /**
     * This is kinda clubbed together to make the Google Charts work.
     * I was able to attach the binding to a directive on an extensible HTML element.
     */
    Yaba.app.directive('googleChart', (/* GoogleChartService */) => {
        return {
            // require: 'gCharts',
            restrict: 'E',
            // link: Yaba.models.Transactions.ngGoogleChart(GoogleChartService)
            link: Yaba.models.Transactions.dataChart
        }
    });

    /**
     * Personal debugging panel for some controls.
     * Allows me to turn central developer mode ON/OFF to control how this app
     * will behave. Some controls are only available when debugging mode is on.
     */
    Yaba.app.directive('debug', () => {
        return {
            restrict: 'E',
            link: ($scope, $element, $attr) => {
                if ( !Yaba.DEBUG ) {
                    $element.hide();
                }
            }
        }
    })
})(Yaba);
