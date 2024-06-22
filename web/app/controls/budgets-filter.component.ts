import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { NgSelectModule } from "@ng-select/ng-select";

import { Budgets, Transactions } from "app/lib/transactions";
import { AccountsService } from "app/services/accounts.service";

/**
 * I needed a way to take a list of budgets and filter them by the end-user's selection.
 * In this way, I can list the budgets and only fire an event containing the user's selections.
 */
@Component({
    selector: 'yaba-budgets',
    templateUrl: './budgets-filter.component.html',
    standalone: true,
    imports: [ CommonModule, FormsModule, NgSelectModule ],
})
export class BudgetsFilterComponent {
    @Input() transactions: Transactions;

    budgets: Budgets;
    @Output() selectedBudgets = new EventEmitter<Budgets>();

    constructor(protected accountsService: AccountsService) {
        this.transactions = new Transactions();
        this.budgets = [];
    }

    ngOnInit() {
        console.log('BudgetsFilterComponent().ngOnInit()');
        this.budgets = this.transactions.getBudgets();
    }

    changed($event: Event) {
        console.log('FilterBudgetComponent().changed()', $event);
        this.selectedBudgets.emit( this.budgets );
    }
}
