import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlsModule } from 'app/controls/controls.module';
import { AccountsComponent } from 'app/accounts/accounts.component';
import { AccountFormComponent } from 'app/forms/account/account-form.component';

@NgModule({
  declarations: [
    AccountFormComponent,
    AccountsComponent,
  ],
  imports: [
    CommonModule,
    ControlsModule
  ],
  exports: [
    AccountFormComponent,
    AccountsComponent,
  ]
})
export class AccountsModule { }
