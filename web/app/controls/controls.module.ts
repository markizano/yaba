import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TrashComponent,
  AddComponent,
  CloseComponent,
  MappingComponent,
  EditComponent,
  SaveComponent,
  ActionsComponent,
  SettingsComponent,
} from 'app/controls/controls.component';

@NgModule({
  declarations: [
    TrashComponent,
    AddComponent,
    CloseComponent,
    MappingComponent,
    EditComponent,
    SaveComponent,
    ActionsComponent,
    SettingsComponent,
  ],
  imports: [ CommonModule ],
  providers: [ ],
  exports: [ TrashComponent, AddComponent, CloseComponent, MappingComponent, EditComponent, SaveComponent, ActionsComponent, SettingsComponent ],
})
export class ControlsModule { }
