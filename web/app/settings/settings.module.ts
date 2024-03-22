import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from 'app/settings/settings.component';

@NgModule({
  imports: [
    CommonModule,
    SettingsComponent,
  ],
  exports: [
    SettingsComponent,
  ]
})
export class SettingsModule { }
