import { Subscription } from 'rxjs';

import { Component, OnInit, OnDestroy } from '@angular/core';

import { Settings } from 'app/lib/settings';
import { Transactions } from 'app/lib/transactions';
import { AccountsService } from 'app/services/accounts.service';
import { Accounts } from 'app/lib/accounts';

@Component({
    selector: 'yaba-prospecting',
    templateUrl: './prospecting.html',
    styleUrls: ['./prospecting.css'],
    standalone: false,
})
export class ProspectingComponent implements OnInit, OnDestroy {
    prospect: Transactions = new Transactions();
    settings: Settings = Settings.fromLocalStorage();
    showIncome: boolean = true;
    showExpense: boolean = true;
    incomeTxns: Transactions = new Transactions();
    expenseTxns: Transactions = new Transactions();
    leftovers: any = { sum: () => 0.0 };
    projections: any = { sum: () => 0.0 };

    // Additional properties from AngularJS translation
    incomeTags: string[] = [];
    expenseTags: string[] = [];
    transferTags: string[] = [];
    hideTags: string[] = [];
    income: [string, any][] = [];
    expense: [string, any][] = [];
    leftoverItems: [string, any][] = [];
    projectionItems: [string, any][] = [];

    #acct?: Subscription;

    constructor(private accountsService: AccountsService) {
        console.info('ProspectingComponent');
    }

    ngOnInit(): void {
        console.info('Prospect controller');

        // Load settings
        this.incomeTags = this.settings.incomeTags;
        this.expenseTags = this.settings.expenseTags;
        this.transferTags = this.settings.transferTags;
        this.hideTags = this.settings.hideTags;

        // Subscribe to accounts service to get transactions
        const update = (accounts: Accounts) => {
            this.loadTransactions(accounts);
        };
        update(this.accountsService.get());
        this.#acct = this.accountsService.subscribe(update);
    }

    ngOnDestroy(): void {
        this.#acct?.unsubscribe();
    }

    private loadTransactions(accounts: any): void {
        const handyGetByTag = (tags: string[]) => accounts.getTransactions(
            undefined,
            new Date(new Date().getTime() - 365 * 24 * 60 * 60 * 1000), // 365 days ago
            new Date(),
            undefined,
            tags,
            -1
        );

        this.incomeTxns = handyGetByTag(this.settings.incomeTags);
        let income = this.incomeTxns.monthly();
        this.income = income.items();

        this.expenseTxns = handyGetByTag(this.settings.expenseTags);
        let expense = this.expenseTxns.monthly();
        this.expense = expense.items();

        // Calculate leftovers and projections
        if (this.incomeTxns.length) {
            this.leftovers = expense.subtract(income);
            this.leftoverItems = this.leftovers.items();

            this.projections = this.leftovers.project(this.prospect);
            this.projectionItems = this.projections.items();
        } else {
            this.leftovers = { sum: () => 0.0 };
            this.leftoverItems = [];

            this.projections = { sum: () => 0.0 };
            this.projectionItems = [];
        }
    }

    // Watch for changes in prospect and recalculate projections
    onProspectChange(): void {
        if (this.incomeTxns.length) {
            this.projections = this.leftovers.project(this.prospect);
            this.projectionItems = this.projections.items();
        }
    }
}
