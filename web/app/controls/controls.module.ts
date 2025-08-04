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
import { NgSelectModule } from '@ng-select/ng-select';

import { icons } from 'app/controls/icons';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    imports: [
        CommonModule,
        NgSelectModule,
        FormsModule,
        MatIconModule,
        icons,
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgSelectModule,
        MatIconModule,
        ...icons,
    ],
})
export class ControlsModule { }
