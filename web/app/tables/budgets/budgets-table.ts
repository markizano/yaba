import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';

import { ControlsModule } from 'app/controls/controls.module';
import { Budgets } from 'app/lib/types';
import { BudgetsService } from 'app/services/budgets.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'yaba-budgets-table',
  templateUrl: './budgets-table.html',
  styleUrls: ['./budgets-table.css'],
  imports: [
    ControlsModule,
  ],
})
export class YabaTableBudgetsComponent implements OnInit, OnDestroy {
  /**
   * Budgets Service keeps communications with the budget table.
   */
  budgetsService: BudgetsService = inject(BudgetsService);

  /**
   * Local storage for budgets.
   */
  budgets: Budgets = new Budgets();

  /**
   * Private subscription to keep up to date.
   */
  #bud?: Subscription;

  ngOnInit(): void {
    const update = (budgets: Budgets) => {
      budgets.sort();
      this.budgets = budgets;
    };
    update(this.budgetsService.get());
    this.#bud = this.budgetsService.subscribe(update);
  }

  ngOnDestroy(): void {
    this.#bud?.unsubscribe();
  }
}
