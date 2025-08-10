import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { ControlsModule } from 'app/controls/controls.module';
import { SettingsComponent } from 'app/pages/settings/settings';

@NgModule({
  declarations: [
    SettingsComponent,
  ],
  imports: [
    ControlsModule,
    MatFormFieldModule,
    MatCheckboxModule,
  ],
  exports: [
    SettingsComponent,
  ]
})
export class SettingsModule { }
