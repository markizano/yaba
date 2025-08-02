/* Angular Requirements */
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from 'app/menu/menu';
import { InstitutionsModule } from 'app/pages/institutions/institutions.module';
import { AccountsModule } from 'app/pages/accounts/accounts.module';
import { ChartsModule } from 'app/pages/charts/charts.module';
import { BudgetingModule } from 'app/pages/budgeting/budgeting.module';
import { SettingsModule } from 'app/pages/settings/settings.module';
import { DevelopComponent } from 'app/pages/develop/develop.component';
import { ControlsModule } from 'app/controls/controls.module';
import { ProspectingModule } from 'app/pages/prospecting/prospecting.module';

@Component({
    selector: 'app-root',
    templateUrl: './yaba.html',
    standalone: true,
    imports: [
        RouterOutlet,
        MenuComponent,
        InstitutionsModule,
        AccountsModule,
        ChartsModule,
        ProspectingModule,
        BudgetingModule,
        SettingsModule,
        ControlsModule,
    ],
    providers: [
        DevelopComponent,
    ]
})
export class YabaComponent { }
