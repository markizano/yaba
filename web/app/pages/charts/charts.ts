import { Subscription } from 'rxjs';

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartType, Row } from 'angular-google-charts';

import { AccountsService } from 'app/services/accounts.service';
import { Accounts } from 'app/lib/accounts';
import { TransactionFilter, Budgets, Tags } from 'app/lib/types';
import { Transactions, Transaction } from 'app/lib/transactions';
import { EMPTY_TRANSACTION_FILTER } from 'app/lib/constants';

@Component({
    selector: 'yaba-charts',
    templateUrl: './charts.html',
    styleUrls: ['./charts.css'],
    standalone: false,
})
export class ChartsComponent implements OnInit, OnDestroy {
    filter: TransactionFilter = EMPTY_TRANSACTION_FILTER;

    // Chart configuration
    chartType: ChartType = ChartType.LineChart;
    chartData: Row[] = [];
    chartOptions: any = {
        title: 'Daily Budget Spending',
        hAxis: { title: 'Date' },
        vAxis: { title: 'Amount ($)' },
        legend: { position: 'bottom' },
        lineWidth: 2,
        pointSize: 4,
        height: 500,
        width: '100%'
    };

    // Core data
    accounts: Accounts = new Accounts();
    transactions: Transactions = new Transactions();
    budgets: Budgets = [];

    // Debug properties (keeping for compatibility with template)
    txnTags: Tags = new Tags();
    myBudgets: any;
    chart: any;

    #acct?: Subscription;

    constructor(private accountsService: AccountsService) {
        console.log('new ChartsComponent()');
    }

    ngOnInit(): void {
        console.info('Charts controller');
        // Subscribe to accounts service
        const update = (accounts: Accounts) => {
            this.accounts = accounts;
            this.filter.accounts = accounts;
            this.loadTransactions();
        };
        update(this.accountsService.get());
        this.#acct = this.accountsService.subscribe(update);
    }

    ngOnDestroy(): void {
        this.#acct?.unsubscribe();
    }

    /**
     * Handler for when transaction filters change
     */
    onFilterChange(filter: TransactionFilter): void {
        this.filter = { ...filter };
        this.loadTransactions();
    }

    /**
     * Load and filter transactions based on current filter settings
     */
    loadTransactions(): void {
        if (!this.accounts || this.accounts.length === 0) {
            return;
        }

        this.transactions.clear();

        // Use the filter object directly for transaction retrieval
        const searchFilter: TransactionFilter = {
            ...this.filter,
            sort: { column: 'datePosted', asc: true }, // Sort ascending for chronological chart
            page: { pageIndex: 0, pageSize: -1, length: 0 } // Get all transactions
        };

        this.transactions.push(...this.accounts.getTransactions(searchFilter));

        // Update debug properties for template compatibility
        this.txnTags = this.filter.tags || new Tags();

        // Generate chart data
        this.generateChartData();
    }

    /**
     * Group transactions by day and budget tags to create chart data
     */
    generateChartData(): void {
        if (!this.transactions.length || !this.filter.tags?.length) {
            this.chartData = [];
            this.myBudgets = []; // For debug display
            return;
        }

        // Filter transactions to only those with selected tags
        const filteredTransactions = this.transactions.byTags(this.filter.tags);

        // Group transactions by date and tag
        const dailyBudgetData = this.groupTransactionsByDayAndBudget(filteredTransactions);

        // Convert to Google Charts format
        this.chartData = this.formatDataForGoogleCharts(dailyBudgetData);
        this.myBudgets = dailyBudgetData; // For debug display

        console.log('Generated chart data:', this.chartData);
    }

    /**
     * Group transactions by day and budget tag
     */
    private groupTransactionsByDayAndBudget(transactions: Transactions): any[] {
        const dailyData: { [date: string]: { [tag: string]: number } } = {};
        const allTags = new Set<string>();

        // Process each transaction
        transactions.forEach((txn: Transaction) => {
            const dateKey = txn.datePosted.toISOShortDate();

            if (!dailyData[dateKey]) {
                dailyData[dateKey] = {};
            }

            // Add transaction amount to each of its tags for this date
            txn.tags.forEach(tag => {
                if (this.filter.tags?.includes(tag)) {
                    allTags.add(tag);
                    if (!dailyData[dateKey][tag]) {
                        dailyData[dateKey][tag] = 0;
                    }
                    dailyData[dateKey][tag] += Math.abs(txn.amount); // Use absolute value for spending
                }
            });
        });

        // Convert to array format for sorting
        const result: any[] = [];
        Object.keys(dailyData).sort().forEach(date => {
            const row: any = { date };
            allTags.forEach(tag => {
                row[tag] = dailyData[date][tag] || 0;
            });
            result.push(row);
        });

        return result;
    }

    /**
     * Format data for Google Charts LineChart
     */
    private formatDataForGoogleCharts(dailyData: any[]): Row[] {
        if (!dailyData.length) {
            return [];
        }

        // Get all unique tags from the data
        const allTags = new Set<string>();
        dailyData.forEach(day => {
            Object.keys(day).forEach(key => {
                if (key !== 'date') {
                    allTags.add(key);
                }
            });
        });

        const tagArray = Array.from(allTags).sort();

        // Create header row
        const header = ['Date', ...tagArray];

        // Create data rows
        const rows = dailyData.map(day => [
            new Date(day.date),
            ...tagArray.map(tag => day[tag] || 0)
        ]);

        return [header, ...rows];
    }
}
