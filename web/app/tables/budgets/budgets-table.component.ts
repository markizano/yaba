import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ControlsModule } from 'app/controls/controls.module';
import { Budgets } from 'app/lib/transactions';

@Component({
    selector: 'yaba-budgets-table',
    templateUrl: './budgets-table.component.html',
    imports: [
        CommonModule,
        FormsModule,
        ControlsModule,
    ],
    standalone: true,
})
export class YabaTableBudgetsComponent {
    @Input() budgets: Budgets;

    constructor() {
        this.budgets = [];
    }

    getBudgets(): Budgets {
        const budgets = this.budgets.concat(); // shallow copy to avoid modifying the original array.
        budgets.sort((a, b) => {
            if (a.tag < b.tag) {
                return -1;
            }
            if (a.tag > b.tag) {
                return 1;
            }
            return 0;
        });
        return budgets;
    }
}
