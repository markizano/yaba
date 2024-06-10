/* Angular Requirements */
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* Yaba/App Requirements */
import { Institutions } from 'app/lib/institutions';
import { Accounts } from 'app/lib/accounts';
import { Transactions } from 'app/lib/transactions';
import { Settings } from 'app/lib/structures';

/* Services */
// import { SessionManagementService } from 'app/session.service';

@Component({
    selector: 'app-root',
    templateUrl: './yaba.component.html',
    styleUrls: ['./yaba.component.css'],
})
export class YabaComponent {
    title = 'yaba';
    // @Input() institutions: Institutions;
    // @Output() institutionsChange = new EventEmitter<Institutions>();

    // @Input() accounts: Accounts;
    // @Output() accountsChange = new EventEmitter<Accounts>();

    // @Input() transactions: Transactions;
    // @Output() transactionsChange = new EventEmitter<Transactions>();

    // @Input() settings: Settings
    // @Output() settingsChange = new EventEmitter<Settings>();

    constructor(/*protected session: SessionManagementService*/) {
        // this.institutions = Institutions.fromString(this.session.getItem('institutions', '{}') as string);
        // this.accounts = Accounts.fromString(this.session.getItem('accounts', '{}') as string);
        // this.transactions = Transactions.fromString(this.session.getItem('transactions', '{}') as string);
        // this.settings = Settings.fromString(this.session.getItem('settings', '{}') as string);
    }
}
