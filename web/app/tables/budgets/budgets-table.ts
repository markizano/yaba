import { Component, Input } from '@angular/core';

import { ControlsModule } from 'app/controls/controls.module';
import { Budgets } from 'app/lib/types';

@Component({
  selector: 'yaba-budgets-table',
  templateUrl: './budgets-table.html',
  styleUrls: ['./budgets-table.css'],
  imports: [
    ControlsModule,
  ],
})
export class YabaTableBudgetsComponent {
  @Input() budgets: Budgets;

  constructor() {
    this.budgets = [];
  }

  getBudgets(): Budgets {
    const budgets = this.budgets.concat() // shallow copy to avoid modifying the original array.
      .filter(a => !!a.tag); // Filter out empty budgets.
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
