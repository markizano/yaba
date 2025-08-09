import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';

import { ControlsModule } from 'app/controls/controls.module';
import { SettingsComponent } from 'app/pages/settings/settings';

@NgModule({
  declarations: [
    SettingsComponent,
  ],
  imports: [
    ControlsModule,
    MatFormFieldModule,
  ],
  exports: [
    SettingsComponent,
  ]
})
export class SettingsModule { }
