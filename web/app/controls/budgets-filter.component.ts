import { Component, EventEmitter, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { Budgets } from "app/lib/transactions";
import { TransactionsService } from "app/services/transactions.service";
import { Transactions } from "app/lib/transactions";

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

    constructor(protected transactionsService: TransactionsService) {
        this.budgets = [];
    }

    ngOnInit() {
        this.transactionsService.load().then(
            (transactions: Transactions) => {
                this.budgets.push(...transactions.getBudgets());
                this.budgets.sort();
            }, (error) => {
                console.error('YabaFilterBudgetsComponent().ngOnInit()', error);
            });
    }

    changed($event: Event) {
        console.log('FilterBudgetComponent().changed()', $event);
        this.selectedBudgets.emit( this.budgets );
    }
}
