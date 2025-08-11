import { Component } from '@angular/core';

/**
 * This component is the main budgeting page. It displays the transactions and allows the user to filter them.
 * The user can also edit the transactions on the page. Changing transactions influences the budgets panel.
 */
@Component({
  selector: 'yaba-budgeting',
  templateUrl: './budgeting.html',
  styleUrls: ['./budgeting.css'],
  standalone: false,
})
export class BudgetingComponent { }
