(function(Yaba){
    /* Forms as angular.directive() */
    Yaba.app.directive('yabaInstitutionForm', () => {
        return {
            templateUrl: '/assets/views/forms/institution.htm',
            controller: 'yabaInstitutionForm',
            scope: {
                institution: '='
            },
            restrict: 'E'
        };
    });

    Yaba.app.directive('yabaAccountForm', (() => {
        return {
            templateUrl: '/assets/views/forms/account.htm',
            controller: 'yabaAccountForm',
            scope: {
                account: '=',
            },
            restrict: 'E'
        };
    }));

    Yaba.app.directive('yabaBudget', () => {
        return {
            templateUrl: '/assets/views/tables/budget.htm',
            controller: 'yabaBudget',
            restrict: 'AE'
        };
    });

    Yaba.app.directive('yabaTransactionList', () => {
        return {
            templateUrl: '/assets/views/tables/transactions.htm',
            controller: 'yabaTransactionList',
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
        }

        function done(parsedCSV) {
            $scope.$emit('csvParsed', parsedCSV);
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
        // Now this can be handled in the controller since we know we are going to handle the results
        // once parsed from the upload attempt.
        $scope.$on('csvParsed', (event, results) => {
            console.log('csvParsed()');
            console.log({event: event});
            console.log({csvResults: results});
            if ( $attr.headers ) {
                // only get back the headers from the CSV file.
                var headers = Object.keys(results.data.shift());
                $scope.institution.mappings = [];
                headers.forEach((h) => {
                    $scope.institution.mappings.push({
                        fromField: h,
                        toField: '',
                        mapType: 'dynamic'
                    });
                })
            } else {
                // Get all the transactions back and fill up the table.
                const account = $scope.account;
                const institution = $scope.institutions.filter(i => i.id == account.institutionId).shift();
                var transactions = Yaba.models.mapInstitution(institution, account, results.data);
                transactions.forEach((txn) => {
                    $scope.account.transactions.unshift(new Yaba.models.Transaction(txn));
                });
            }
            $scope.$apply();

        })

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
