import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlsModule } from 'app/controls/controls.module';
import { AccountComponent } from 'app/account/account.component';

@NgModule({
  declarations: [
    AccountComponent,
  ],
  imports: [
    CommonModule,
    ControlsModule
  ],
  exports: [
    AccountComponent,
  ]
})
export class AccountsModule { }
