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
                selectedAccounts: '=?',
                fromDate: '=?',
                toDate: '=?',
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
                console.log(`Papa.parse() error from ${file} in ${element}: ${err}`);
                console.log(reason);
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
    Yaba.app.directive('csvdrop', () => {
        return {
            link: csvdrop,
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
                $element.hide();
            }
        }
    })
})(Yaba);
