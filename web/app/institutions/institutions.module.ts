import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlsModule } from 'app/controls/controls.module';
import { InstitutionsComponent } from 'app/institutions/institutions.component';
import { InstitutionFormComponent } from 'app/forms/institution/institution-form.component';
import { MappingComponent } from 'app/forms/institution/mapping.component';


@NgModule({
  declarations: [
    InstitutionFormComponent,
    MappingComponent,
    InstitutionsComponent,
  ],
  imports: [
    CommonModule,
    ControlsModule
  ],
  exports: [
    InstitutionFormComponent,
    MappingComponent,
    InstitutionsComponent,
  ]
})
export class InstitutionsModule { }
