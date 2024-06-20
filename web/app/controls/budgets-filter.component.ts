import { Component, EventEmitter, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { NgSelectModule } from "@ng-select/ng-select";

import { Budgets, TransactionFilter } from "app/lib/transactions";
import { AccountsService } from "app/services/accounts.service";
import { Subscription } from "rxjs";

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
    budgets: Budgets;
    @Output() selectedBudgets = new EventEmitter<Budgets>();
    #cacheUpdate: Subscription;

    constructor(protected accountsService: AccountsService) {
        this.budgets = [];
        this.#cacheUpdate = this.accountsService.subscribe((accounts) => {
            console.log('BudgetsFilterComponent().accountService.subscribe() loaded accounts:', accounts);
            this.budgets.push(...accounts.getTransactions(<TransactionFilter>{}).getBudgets());
        });
    }

    ngOnDestroy() {
        this.#cacheUpdate.unsubscribe();
    }

    changed($event: Event) {
        console.log('FilterBudgetComponent().changed()', $event);
        this.selectedBudgets.emit( this.budgets );
    }
}
