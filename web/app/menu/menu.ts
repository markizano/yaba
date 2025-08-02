import { Component } from '@angular/core';
import { RouterModule, Route } from '@angular/router';
import { routeConfig } from 'app/routing';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'yaba-menu',
    templateUrl: './menu.html',
    styleUrl: './menu.css',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatIconModule,
        MatButtonModule,
        MatSidenavModule,
        MatListModule,
        MatToolbarModule,
    ],
})
export class MenuComponent {
    public routes: Route[] = routeConfig.filter(route => route.path !== '**' && route.path !== '');
    isExpanded = true;

    toggleSidebar(): void {
        this.isExpanded = !this.isExpanded;
    }

    getSidebarWidth(): string {
        return this.isExpanded ? '280px' : '64px';
    }

    getMainContentMargin(): string {
        return this.isExpanded ? '280px' : '64px';
    }

    trackByRoute(index: number, route: Route): string {
        return route.path || '';
    }

    getRouteIcon(path: string): string {
        const iconMap: { [key: string]: string } = {
            '': 'home',
            'budgeting': 'account_balance_wallet',
            'accounts': 'account_balance',
            'institutions': 'business',
            'charts': 'bar_chart',
            'prospect': 'trending_up',
            'settings': 'settings',
            'develop': 'bug_report'
        };
        return iconMap[path] || 'help';
    }

    onLogoError(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.style.display = 'none';
        console.warn('Logo image failed to load');
    }
}
