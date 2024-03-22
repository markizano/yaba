import { Component, Input, Output } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { AccountTypes, Accounts, IAccount } from 'app/lib/accounts';
import { Institutions } from 'app/lib/institutions';
import { FormMode } from 'app/lib/structures';

@Component({
  selector: 'yaba-account-form',
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.css'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(600, style({opacity: 1}))
      ])
    ])
  ]
})
export class AccountFormComponent {
  @Input() public account?: IAccount;
  @Output() public accounts?: Accounts;
  visible?: boolean;
  mode: FormMode = FormMode.Create;
  protected institutions: Institutions = new Institutions();
  protected AccountTypes = AccountTypes;

  constructor() {
    this.reset();
    //@TODO: Read institutions from database.
  }

  public save() {
    // Perform form validation to ensure fields are not empty.
    // If they are, display a message to the user.
  }

  public cancel() {
    this.close();
    this.reset();
  }

  public close() {
    this.visible = false;
  }

  public reset() {
    this.mode = FormMode.Create;
  }
}
