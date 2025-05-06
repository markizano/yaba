import { Component, Input } from '@angular/core';
import { TransactionFilter } from 'app/lib/types';

@Component({
  selector: 'yaba-charts',
  templateUrl: './charts.component.html',
  standalone: false,
})
export class ChartsComponent {
    @Input() filter: TransactionFilter = <TransactionFilter>{};

    constructor() {
        console.log('new ChartsComponent()');
    }
}
/*
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
*/
