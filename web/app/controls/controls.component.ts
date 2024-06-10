import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Account, Accounts } from 'app/lib/accounts';
import { Transactions } from 'app/lib/transactions';

@Component({
    selector: 'yaba-pagination',
    templateUrl: './pagination.component.html',
    standalone: true,
    imports: [ CommonModule, FormsModule ],
})
export class YabaTxnPaginationComponent {
    title = 'Pagination';
    @Input() itemCount = 0;
    itemsPerPage = 10;
    offset = 0;
    page = 1;
    pageCount = 1;

    constructor() {
        this.refresh();
    }

    setPage($page: number) {
        if ( $page < 0 || $page > this.pageCount -1 ) return;
        this.page = $page;
        this.offset = $page * this.itemsPerPage;
    }

    previous() {
        this.setPage(this.page -1);
    }

    proximo() {
        this.setPage(this.page +1);
    }

    refresh() {
        this.pageCount = Math.round( this.itemCount / this.itemsPerPage );
        if ( this.itemCount >= this.itemsPerPage ) {
            this.pageCount += 1;
        }
        this.setPage(0);
    }

    keyNavigate($event: KeyboardEvent) {
        // Right
        if ( $event.key == 'ArrowRight' ) {
            $event.preventDefault();
            this.proximo();
        // Left
        } else if ( $event.key == 'ArrowLeft') {
            $event.preventDefault();
            this.previous();
        }
    }
}

@Component({
    selector: 'yaba-daterange',
    templateUrl: './daterange.component.html',
    standalone: true,
    imports: [ CommonModule, FormsModule ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
})
export class YabaFilterDateRangeComponent {
    title = 'Date Range';
    @Input() fromDate: Date;
    @Input() toDate: Date;
    @Output() fromDateChange = new EventEmitter<Date>();
    @Output() toDateChange = new EventEmitter<Date>();

    constructor() {
        this.fromDate = new Date();
        this.toDate = new Date();
    }

    /**
     * In this way, if either date object is changed, both are sent an update event.
     * @param $event {Event} Event object from the DOM
     */
    changed($event: Event) {
        console.log($event);
        this.fromDateChange.emit( this.fromDate );
        this.toDateChange.emit( this.toDate );
    }
}

@Component({
    selector: 'yaba-accounts',
    templateUrl: './account-filter.component.html',
    styles: [ ],
    standalone: true,
    imports: [ CommonModule, FormsModule ],
})
export class YabaFilterAccountsComponent {
  @Input() accounts: Accounts;
  @Output() selectedAccounts: EventEmitter<Account[]> = new EventEmitter<Account[]>();

  constructor() {
    this.accounts = new Accounts();
  }

  /**
   * I use a separate event to only notify of selected accounts instead of changing the
   * underlying bound account list to maintain the list box in the DOM/UI.
   * @param accounts {IAccount} Accounts selected by end-user
   */
  changed(accounts: Account[]) {
    this.selectedAccounts.emit(accounts);
  }
}

@Component({
    selector: 'yaba-description',
    templateUrl: './description.component.html',
    styles: [  ],
    standalone: true,
    imports: [ CommonModule, FormsModule ],

})
export class YabaFilterDescriptionComponent {
    @Input() description: string|RegExp;
    useRegexp: boolean;
    @Output() descriptionChange = new EventEmitter<string|RegExp>();

    constructor() {
        this.description = '';
        this.useRegexp = false;
    }

    changed(description: string|RegExp, useRegexp: boolean) {
        if ( useRegexp ) {
            this.descriptionChange.emit( new RegExp(description) );
        } else {
            this.descriptionChange.emit( description );
        }
    }
}

@Component({
    selector: 'yaba-budgets',
    templateUrl: './budgets-filter.component.html',
    styles: [  ],
    standalone: true,
    imports: [ CommonModule, FormsModule ],
})
export class YabaFilterBudgetsComponent {
    title = 'Budgets';
    @Input() budgets: string[] = [];
    @Output() selectedBudgets = new EventEmitter<string[]>();

    changed(budget: string[]) {
        this.selectedBudgets.emit( budget );
    }
}

@Component({
    selector: 'transaction-filters',
    templateUrl: './txn-filter.component.html',
    standalone: true,
    imports: [
        CommonModule,
        YabaFilterDateRangeComponent,
        YabaFilterAccountsComponent,
        YabaFilterDescriptionComponent,
        YabaFilterBudgetsComponent,
    ],
})
export class TransactionFilterComponent {
    title = 'Transaction Filters';
    @Input() showDaterange: boolean;
    @Input() showAccounts: boolean;
    @Input() showDescription: boolean;
    @Input() showTags: boolean;
    @Input() txns: Transactions;
    @Input() accounts: Accounts;
    @Input() fromDate: Date;
    @Input() toDate: Date;
    @Input() description: string|RegExp;
    @Input() budgets: string[];
    @Output() fromDateChange = new EventEmitter<Date>();
    @Output() toDateChange = new EventEmitter<Date>();
    @Output() descriptionChange = new EventEmitter<string|RegExp>();
    @Output() selectedBudgets = new EventEmitter<string[]>();
    @Output() selectedAccounts = new EventEmitter<Account[]|Accounts>();

    constructor() {
        this.showDaterange = true;
        this.showAccounts = true;
        this.showDescription = true;
        this.showTags = true;
        this.txns = new Transactions();
        this.accounts = new Accounts();
        this.fromDate = new Date();
        this.toDate = new Date();
        this.description = '';
        this.budgets = [];
    }

    useAccounts(accounts: Account[]) {
        this.selectedAccounts.emit(accounts);
    }

    useBudgets(budgets: string[]) {
        this.selectedBudgets.emit(budgets);
    }
}
