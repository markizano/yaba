import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ControlsModule } from 'app/controls/controls.module';
import { BudgetStruct } from 'app/lib/structures';

@Component({
    selector: 'yaba-budgets-table',
    templateUrl: './budgets-table.component.html',
    styleUrls: ['./budgets-table.component.css'],
    imports: [
        CommonModule,
        FormsModule,
        ControlsModule,
    ],
    standalone: true,
})
export class YabaTableBudgetsComponent {
    @Input() budgets: BudgetStruct[];

    constructor() {
        this.budgets = [];
    }

    getBudgets(): BudgetStruct[] {
        const budgets: BudgetStruct[] = [...this.budgets];
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
