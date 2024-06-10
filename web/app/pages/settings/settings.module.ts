import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from 'app/settings/settings.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { ControlsModule } from 'app/controls/controls.module';
import { MatChipsModule } from '@angular/material/chips';

@NgModule({
  declarations: [
    SettingsComponent,
  ],
  imports: [
    CommonModule,
    MatListModule,
    MatChipsModule,
    MatIconModule,
    MatCheckboxModule,
    ControlsModule,
  ],
  exports: [
    SettingsComponent,
  ]
})
export class SettingsModule { }
