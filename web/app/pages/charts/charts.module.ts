import { NgModule } from '@angular/core';

import { ChartsComponent } from 'app/pages/charts/charts.component';
import { ControlsModule } from 'app/controls/controls.module';


@NgModule({
  declarations: [
    ChartsComponent,
  ],
  imports: [
    ControlsModule,
  ],
  exports: [
    ChartsComponent,
  ]
})
export class ChartsModule { }
