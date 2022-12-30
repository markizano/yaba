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
            controller: 'yabaBudgetCtrl',
            restrict: 'AE'
        };
    });

    Yaba.app.directive('yabaTransactionList', () => {
        return {
            templateUrl: '/assets/views/tables/transactions.htm',
            controller: 'yabaTransactionListCtrl',
            scope: {
                'transactions': '='
            },
            restrict: 'E'
        };
    });

    function wishlist($scope, $element, $attr) {
        $scope.wishlist = $scope.wishlist || [];
        $scope.sortColumn = 'datePosted';

        $scope.add = function add() {
            this.wishlist.push({
                amount: this.amount,
                datePurchase: this.datePurchase,
                description: this.description
            });
        };

        $scope.sortBy = function sortBy(field) {
            this.sortColumn = field;
        };
    }
    Yaba.app.directive('yabaWishlist', () => {
        return {
            templateUrl: '/assets/views/prospect/wishlist.htm',
            link: wishlist,
            scope: {
                wishlist: '='
            },
            restrict: 'E'
        };
    });

    /**
     * Enables one to include class="dropable" as an attribute and it'll attach this event that will
     * handle dragging a file into the element.
     */
    function filedrop($scope, $element, $attr) {
        let institutionId, accountId;
        if ($scope.account) {
            institutionId = $scope.account.institutionId || '';
            accountId = $scope.account.id || '';
        }
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

        function parseError(err, file, element, reason) {
            console.log(`Papa.parse() error from ${file} in ${element}: ${err}`);
            console.log(reason);
            // @TODO: Find a way to notify the end-user of a failure.
            $scope.emit('csvError', {
                err,
                file,
                element,
                reason,
                institutionId,
                accountId
            });
        }

        function done(parsedCSV) {
            let event = {
                parsedCSV,
                institutionId,
                accountId
            };
            $scope.$emit('csvParsed', event);
        }

        function drop(event) {
            if ( event ) { event.preventDefault(); }
            unlight(event);
            angular.forEach(event.originalEvent.dataTransfer.files, (uploadFile) => {
                Papa.parse(uploadFile, {
                    header: true,
                    skipEmptyLines: true,
                    error: parseError,
                    complete: done
                });
            });
        }

        $element.bind('dragover', highlight);
        $element.bind('dragenter', highlight);
        $element.bind('dragleave', unlight);
        $element.bind('dragend', unlight);
        $element.bind('drop', drop);
    }
    Yaba.app.directive('dropable', () => {
        return {
            link: filedrop,
            restrict: 'AC'
        }
    })

    Yaba.app.directive('yabaDaterange', () => {
        return {
            templateUrl: '/assets/views/daterange.htm',
            restrict: 'E'
        }
    });

})(Yaba);
