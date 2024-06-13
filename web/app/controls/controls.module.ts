/**
 * Controls module
 * Handles the importing of a bunch of core and control components, tools and oddities that are used throughout the app.
 * Makes it easier to include this module and have access to:
 * - CommonModule
 * - FormsModule
 * - ReactiveFormsModule
 * - BrowserAnimationsModule
 * - NgSelectModule
 * 
 * and all the other custom Yaba compnents that help manage user input via tools and icons.
 * 
 * All the pipes, directives and custom components that go into perceiving user input are wired through this module.
 */

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

import { YabaTxnPaginationComponent } from 'app/controls/pagination.component';
import { TransactionFilterComponent } from 'app/controls/txn-filter.component';

import { YabaDropFileDirective } from 'app/controls/dropfile.directive';
import { SortByTxnHeaderPipe } from 'app/tables/transactions/sort-by-txn-header.pipe';

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
        SortByTxnHeaderPipe,
        TransactionFilterComponent,
    ],
    providers: [ ],
    exports: [
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TransactionFilterComponent,
        NgSelectModule,
        SortByTxnHeaderPipe,
        ...components,
    ],
})
export class ControlsModule { }
