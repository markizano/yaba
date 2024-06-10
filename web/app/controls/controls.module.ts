import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgSelectModule } from '@ng-select/ng-select';

import {
  ActionsComponent,
  AddComponent,
  CloseComponent,
  DebugComponent,
  EditComponent,
  InspectComponent,
  QuestionComponent,
  SaveComponent,
  SettingsComponent,
  TrashComponent,
} from 'app/controls/icons.component';

import {
  YabaTxnPaginationComponent,
  TransactionFilterComponent,
} from 'app/controls/controls.component';

import { YabaDropFileDirective } from 'app/controls/dropfile.directive';

const components = [
  ActionsComponent,
  AddComponent,
  CloseComponent,
  DebugComponent,
  EditComponent,
  InspectComponent,
  QuestionComponent,
  SaveComponent,
  SettingsComponent,
  TrashComponent,
  YabaDropFileDirective,
];

@NgModule({
  declarations: components,
  imports: [
    CommonModule,
    YabaTxnPaginationComponent,
    TransactionFilterComponent,
  ],
  providers: [ ],
  exports: [
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...components,
    TransactionFilterComponent,
    NgSelectModule,
],
})
export class ControlsModule { }
