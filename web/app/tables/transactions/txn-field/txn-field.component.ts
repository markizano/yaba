import { Component, EventEmitter, Input, Output } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { NgSelectModule } from '@ng-select/ng-select';
import { ControlsModule } from 'app/controls/controls.module';
import { Accounts } from 'app/lib/accounts';
import { Transaction, TransactionType } from 'app/lib/transactions';
import { Id2NameHashMap, NgSelectable } from 'app/lib/types';
import { AccountsService } from 'app/services/accounts.service';
import { Subscription } from 'rxjs';

/**
 * One field to rule them all.
 * This master field type takes a transaction and which field you want it to display and it will render that field as a <td> element.
 * <txn-field> is synonymous with <td> in a table with ✨features✨ to help us render the correct data type and handle editing seamlessly.
 */
@Component({
    selector: '.yaba-txn-field',
    standalone: true,
    imports: [
        ControlsModule,
        NgSelectModule,
        MatChipsModule,
        MatIconModule,
    ],
    templateUrl: './txn-field.component.html',
})
export class TxnFieldComponent {
    readonly separatorKeysCodes = [ENTER, COMMA] as const;
    @Input() editing = false;
    @Input() txn = new Transaction();
    @Output() txnChange = new EventEmitter<Transaction>();
    @Input() field: keyof Transaction = 'id';
    @Input() truncate = false;

    accounts = new Accounts();
    accountId2name: Id2NameHashMap = {};
    #cachedUpdates?: Subscription;

    constructor(protected accountsService: AccountsService) { }

    ngOnInit() {
        this.accounts = this.accountsService.get();
        this.accountId2name = this.accounts.id2name;
        this.#cachedUpdates = this.accountsService.subscribe((accounts: Accounts) => {
            this.accounts = accounts;
            this.accountId2name = accounts.id2name;
        });
    }

    ngOnDestroy() {
        this.#cachedUpdates?.unsubscribe();
    }

    getTransactionTypes(): NgSelectable<TransactionType>[] {
        return [
            { value: TransactionType.Credit, label: 'Credit' },
            { value: TransactionType.Debit, label: 'Debit' },
            { value: TransactionType.Transfer, label: 'Transfer' },
            { value: TransactionType.Payment, label: 'Payment' },
        ];
    }

    add($event: MatChipInputEvent) {
        this.txn.addTag($event.value);
        this.txnChange.emit(this.txn);
    }

    remove($event: MatChipEvent) {
        this.txn.removeTag($event.chip.value);
        this.txnChange.emit(this.txn);
    }

    edit(prevVal: string, $event: MatChipEvent) {
        this.txn.removeTag(prevVal);
        this.txn.addTag($event.chip.value);
        this.txnChange.emit(this.txn);
    }
}
