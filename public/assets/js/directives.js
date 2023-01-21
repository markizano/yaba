(function(Yaba){

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

    Yaba.app.directive('yabaBudget', () => {
        return {
            templateUrl: '/assets/views/tables/budget.htm',
            scope: {
                budget: '=',
                transactions: '=',
                selectedAccounts: '=',
                fromDate: '=',
                toDate: '=',
            },
            controller: 'yabaBudgetCtrl',
            restrict: 'AE'
        };
    });

    Yaba.app.directive('yabaTransactionList', () => {
        return {
            templateUrl: '/assets/views/tables/transactions.htm',
            controller: 'yabaTransactionListCtrl',
            scope: {
                _transactions: '=transactions',
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

    Yaba.app.directive('csvdrop', () => {
        return {
            link: Yaba.Links.csvdrop,
            restrict: 'AC'
        }
    })

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
    Yaba.app.directive('txnEdit', ($timeout) => {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: Yaba.models.Transactions.txnTable($timeout)
        }
    });

    Yaba.app.directive('yabaControls', () => {
        return {
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

    Yaba.app.directive('googleChart', (/* GoogleChartService */) => {
        return {
            // require: 'gCharts',
            restrict: 'E',
            // link: Yaba.models.Transactions.ngGoogleChart(GoogleChartService)
            link: Yaba.models.Transactions.dataChart
        }
    });

    Yaba.app.directive('debug', () => {
        return {
            restrict: 'E',
            link: ($scope, $element, $attr) => {
                //@TODO: Somehow make this a config to hide all <debug /> tags instead of commenting this line.
                if ( !Yaba.DEBUG ) {
                    $element.hide();
                }
            }
        }
    })
})(Yaba);
