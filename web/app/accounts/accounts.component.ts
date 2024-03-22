import { Component } from '@angular/core';
import { Accounts } from 'app/lib/accounts';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: [ './accounts.component.css' ],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(600, style({opacity: 1}))
      ])
    ])
  ]
})
export class AccountsComponent {
  title = 'Accounts';
  accounts: Accounts;

  constructor() {
    this.accounts = new Accounts();
  }
}
