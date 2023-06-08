const Yaba = window.Yaba;
/**
 * Filters not available to AngularJS by default, but we want to include ability here.
*/
(function(Yaba) {
    'use strict';

    /* angular.filter() */
    function budgetBy() {
        return (transactions, filterTags) => {
            if ( !transactions ) return transactions;
            if ( !filterTags ) return transactions;
            var result = [], txnIds = [];
            transactions.forEach((transaction) => {
                if ( typeof filterTags == 'string' ) {
                    filterTags = filterTags.split(',');
                }
                filterTags.forEach((incomeTag) => {
                    if ( transaction.tags.includes(incomeTag.trim()) ) {
                        if ( !txnIds.includes(transaction.id) ) {
                            result.push(transaction);
                            txnIds.push(transaction.id);
                        }
                    }
                });
            })
            return result;
        };
    }

    function sortBy(sortAgent) {
        return (field) => {
            sortAgent.asc = sortAgent.column == field? !sortAgent.asc: true;
            sortAgent.column = field;
        };
    }

    Yaba.hasOwnProperty('filters') || (Yaba.filters = {
        budgetBy: budgetBy(),
        sortBy: sortBy
    });

    console.log(Yaba)
    Yaba.app.filter('budgetBy', budgetBy);
    return Yaba;
})(Yaba);
