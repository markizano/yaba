import { Component } from '@angular/core';
import { Settings } from 'app/lib/settings';
import { Transactions } from 'app/lib/transactions';

@Component({
    selector: 'yaba-prospecting',
    templateUrl: './prospecting.html',
    styleUrls: ['./prospecting.css'],
    standalone: false,
})
export class ProspectingComponent {
    prospect: Transactions = new Transactions();
    settings: Settings = Settings.fromLocalStorage();
    showIncome: boolean = true;
    showExpense: boolean = true;
    incomeTxns: Transactions = new Transactions();
    expenseTxns: Transactions = new Transactions();
    leftovers: Transactions = new Transactions();
    projections: Transactions = new Transactions();

    constructor() {
        console.info('ProspectingComponent');
    }
}

/*
    function Prospect($scope, accounts, prospects, Settings) {
        console.info('Prospect controller');
        $scope.prospect         = prospects;
        $scope.incomeTags       = Settings.incomeTags;
        $scope.expenseTags      = Settings.expenseTags;
        $scope.transferTags     = Settings.transferTags;
        $scope.hideTags         = Settings.hideTags;
        $scope.budgetBy         = Yaba.filters.budgetBy;
        $scope.showIncome       = true;
        $scope.showExpense      = true;

        const handyGetByTag = tags => accounts.getTransactions(
            undefined,
            new Date( new Date() - Yaba.models.Settings.TransactionDeltas.days365 ), // @TODO: This may be revisited...
            new Date(),
            undefined,
            tags,
            -1
        );
        $scope.incomeTxns = handyGetByTag(Settings.incomeTags);
        let income = $scope.incomeTxns.monthly();
        $scope.income = income.items();

        $scope.expenseTxns = handyGetByTag(Settings.expenseTags);
        let expense = $scope.expenseTxns.monthly();
        $scope.expense = expense.items();

        // @TODO: Document why there are two objects here and why we can't just use one.
        // what was I thinking with .items() ??
        if ( $scope.incomeTxns.length ) {
            $scope.leftovers = expense.subtract(income);
            $scope.leftoverItems = $scope.leftovers.items();

            $scope.projections = $scope.leftovers.project(prospects);
            $scope.projectionItems = $scope.projections.items();
        } else {
            $scope.leftovers = { sum: () => 0.0 };
            $scope.leftoverItems = [];

            $scope.projections = { sum: () => 0.0 };
            $scope.projectionItems = [];
        }

        $scope.$watchCollection('prospect', () => {
            $scope.projections = $scope.leftovers.project(prospects);
            $scope.projectionItems = $scope.projections.items();
        });

        Yaba.$prospect = $scope; //@DEBUG
    }
    Prospect.$inject = ['$scope', 'accounts', 'prospects', 'Settings'];
    Yaba.app.controller('prospect', Ctrl.prospect = Prospect);

*/
