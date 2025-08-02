
import { Component, Inject, DOCUMENT } from '@angular/core';


import { Subscription } from 'rxjs';
import * as saveAs from 'file-saver';

import { EMPTY_TRANSACTION_FILTER, NULLDATE } from 'app/lib/constants';
import { Settings } from 'app/lib/settings';
import { SeedList } from 'app/lib/debuggers';
import { Institution, InstitutionMapping, Institutions, MapTypes } from 'app/lib/institutions';
import { Account, Accounts, AccountTypes } from 'app/lib/accounts';
import { Transaction, Transactions } from 'app/lib/transactions';

import { ControlsModule } from 'app/controls/controls.module';
import { AccountsService } from 'app/services/accounts.service';
import { TransactionsListComponent } from 'app/tables/transactions/transactions-list.component';


@Component({
    selector: 'yaba-develop',
    standalone: true,
    imports: [
        ControlsModule,
        TransactionsListComponent,
    ],
    templateUrl: './develop.component.html',
})
export class DevelopComponent {
    transactions = new Transactions();
    filters = EMPTY_TRANSACTION_FILTER;
    #cachedUpdate?: Subscription;

    // SeedList and CSV file generation testing
    seedlist = new SeedList();
    institution?: Institution;
    account?: Account;
    transaction?: Transaction;
    csvFile = '';

    constructor(protected accountsService: AccountsService, @Inject(DOCUMENT) protected document: Document ) {
        this.filters.fromDate = NULLDATE;
        this.filters.accounts = [];
        const Yaba = {
            Institution, Institutions,
            Account, Accounts,
            Transaction, Transactions,
        };
        Object.assign(this.document, {Yaba: Yaba});
    }

    ngOnInit() {
        console.log('DevelopComponent ngOnInit()');
        const update = (accounts: Accounts) => {
            this.transactions.clear();
            this.transactions = Transactions.fromList(accounts.map(a => a.transactions).flat()).sorted();
        }
        update(this.accountsService.get());
        this.#cachedUpdate = this.accountsService.subscribe((accounts: Accounts) => update(accounts));
    }

    ngOnDestroy() {
        this.#cachedUpdate?.unsubscribe();
    }

    log(data: unknown) {
        console.log(data);
    }

    produceCSV(txnCount: number = 10, acctType: string) {
        const map2string = (t: Transaction) => (m: InstitutionMapping) => m.toField !== undefined && (t[m.toField] instanceof Date? (<Date>t[m.toField]).toISOShortDate(): t[m.toField]);
        const institution = this.seedlist.genInstitution();
        const account = this.seedlist.genAccount(institution.id);
        const mapFields = institution.mappings.filter(m => m.mapType == MapTypes.dynamic);
        const oneYear = new Date(Date.now() - Settings.fromLocalStorage().txnDelta).setDate(15),
          today = new Date();
        const nextDay = (dt: Date): number => {
            const day = dt.getDate();
            if ( day <= 10 ) return 15;
            if ( day > 17 ) return 45;
            if ( day < 30 ) return dt.getMonth() == 1? 28: 30;
            if ( day >= 30 ) return 45;
            return 1;
        }
        switch(acctType) {
            case AccountTypes.Checking:
                // l=0 is backup break from loop
                for ( let start = new Date(oneYear), l=0; start <= today && l<=500; start.setDate(nextDay( start )), l++  ) {
                    console.log('payday: ', start.toISOShortDate());
                    account.transactions.add(this.seedlist.genTransaction(
                        account.id, {
                            ttype: 'deposit',
                            maxAmount: 1200,
                            minAmount: 950
                        }
                    ));
                }
                console.log('income txns: ', account.transactions.length);
                for ( let i=0; i <= SeedList.number(account.transactions.length/2, account.transactions.length, 0); i++ ) {
                    account.transactions.add(this.seedlist.genTransaction(
                        account.id, {
                            ttype: 'withdraw',
                            withdrawType: 'payment',
                            maxAmount: 300
                        }
                    ));
                }
                break;
            case AccountTypes.Savings:
                for ( let start = new Date(oneYear); start <= today; start.setDate( nextDay(start) )  ) {
                    account.transactions.add(this.seedlist.genTransaction(
                        account.id, {
                            ttype: 'deposit',
                            maxAmount: 120,
                            minAmount: 90
                        }
                    ));
                }
                break;
            case AccountTypes.Credit:
                for ( let i=0; i <= txnCount; i++ ) {
                    account.transactions.add(this.seedlist.genTransaction(account.id, {ttype: 'withdraw', withdrawType: 'sale'}));
                }
                break;
        }
        account.transactions.sorted();
        this.csvFile = '"' + mapFields.map(m => m.fromField).join('","') + '"\n"'
          + account.transactions
            .map((t: Transaction) => mapFields.map(map2string(t))
            .join('","') )
            .join('"\n"') + '"';
    }

    downloadCSV() {
        const csvBlob = new Blob([this.csvFile], { type: 'text/csv' } );
        saveAs(csvBlob, 'mock-transactions.csv');
    }

    genInstitution() {
        this.institution = this.seedlist.genInstitution();
    }

    genAccount() {
        this.account = this.seedlist.genAccount(this.institution?.id || '');
    }

    genTransaction() {
        this.transaction = this.seedlist.genTransaction(this.account?.id || '', {ttype: 'withdraw', withdrawType: 'sale'});
    }

    bindInstitution($event: string) {
        (<Institution>this.institution).id = $event;
    }

    bindAccount($event: string) {
        (<Account>this.account).id = $event;
    }
}
