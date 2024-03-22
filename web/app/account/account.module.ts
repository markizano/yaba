import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlsModule } from 'app/controls/controls.module';
import { AccountComponent } from 'app/account/account.component';
import { AccountFormComponent } from 'app/forms/account/account-form.component';

@NgModule({
  declarations: [
    AccountFormComponent,
    AccountComponent,
  ],
  imports: [
    CommonModule,
    ControlsModule
  ],
  exports: [
    AccountFormComponent,
    AccountComponent,
  ]
})
export class AccountsModule { }
