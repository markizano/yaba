import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

import { AccountTypes, Account } from 'app/lib/accounts';
import { Institutions } from 'app/lib/institutions';
import { FormMode } from 'app/lib/structures';
import { ControlsModule } from 'app/controls/controls.module';

@Component({
  selector: 'yaba-account-form',
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.css'],
  standalone: true,
  imports: [
    ControlsModule,
    CommonModule,
    FormsModule,
  ],
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
  @Input() account: Account;
  @Input() visible: boolean;
  @Input() mode: FormMode = FormMode.Create;
  @Output() accountChange = new EventEmitter<Account>();
  institutions: Institutions = new Institutions();
  AccountTypes = AccountTypes;

  constructor() {
    this.account = new Account();
    this.reset();
    this.visible = true;
    //@TODO: Read institutions from database.
  }

  public save() {
    // Perform form validation to ensure fields are not empty.
    // If they are, display a message to the user.
    this.accountChange.emit(this.account);
  }

  public cancel() {
    this.reset();
    this.close();
  }

  public close() {
    this.mode = FormMode.Create;
    this.visible = false;
  }

  public reset() {
    this.account = new Account();
  }
}
