import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ControlsModule } from 'app/controls/controls.module';
import { SettingsComponent } from 'app/pages/settings/settings';

@NgModule({
  declarations: [
    SettingsComponent,
  ],
  imports: [
    FormsModule,
    ControlsModule,
    MatListModule,
    MatChipsModule,
    MatIconModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  exports: [
    SettingsComponent,
  ]
})
export class SettingsModule { }
