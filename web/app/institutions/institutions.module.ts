import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlsModule } from 'app/controls/controls.module';
import { InstitutionsComponent } from 'app/institutions/institutions.component';
import { InstitutionFormComponent } from 'app/forms/institution/institution-form.component';


@NgModule({
  declarations: [
    InstitutionsComponent,
  ],
  imports: [
    CommonModule,
    ControlsModule,
    InstitutionFormComponent,
  ],
  exports: [
    InstitutionFormComponent,
    InstitutionsComponent,
  ]
})
export class InstitutionsModule { }
