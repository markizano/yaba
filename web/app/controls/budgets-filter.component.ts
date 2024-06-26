import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { NgSelectModule } from "@ng-select/ng-select";

import { Transactions } from "app/lib/transactions";
import { Budgets } from "app/lib/types";

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
    @Input() transactions = new Transactions();

    budgets = <Budgets>[];
    @Output() selectedBudgets = new EventEmitter<Budgets>();

    ngOnChanges() {
        console.log('BudgetsFilterComponent().ngOnChanges()', this.transactions.length);
        this.budgets = this.transactions.getBudgets();
        console.debug(this.budgets);
    }

    ngOnInit() {
        console.log('BudgetsFilterComponent().ngOnInit()');
        this.budgets = this.transactions.getBudgets();
    }

    changed($event: Budgets) {
        console.log('BudgetsFilterComponent().changed()', $event);
        this.selectedBudgets.emit( $event );
    }
}
