import { debounceTime, Subject, Subscription } from "rxjs";
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, forwardRef, inject } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

import { Tags, Budgets } from "app/lib/types";
import { AccountsService } from "app/services/accounts.service";
import { Accounts } from "app/lib/accounts";
import { Transactions } from "app/lib/transactions";

/**
 * I needed a way to take a list of budgets and filter them by the end-user's selection.
 * In this way, I can list the budgets and only fire an event containing the user's selections.
 */
@Component({
    selector: 'yaba-budgets, yaba-tags',
    standalone: false,
    templateUrl: './tags-selector.html',
    styleUrls: ['./tags-selector.css'],
    providers: [{ // Enables the use of [(ngModel)] to be passed to this component.
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => TagsSelectorComponent),
        multi: true
    }]
})
export class TagsSelectorComponent implements OnInit, OnDestroy, ControlValueAccessor {
    // ControlValueAccessor implementation
    onChange = (_: Tags) => {};
    onTouched = () => {};
    disabled: boolean = false;

    // Service injection
    accountsService = inject(AccountsService);

    // Local data
    availableTags: Tags = [];
    #accts?: Subscription;
    #tagSub?: Subscription;

    tagsChange = new Subject<Tags>();
    @Output() selected = new EventEmitter<Tags>();

    ngOnInit() {
        // Subscribe to accounts service to get transactions and extract budgets
        const update = (accounts: Accounts) => {
            // Get all transactions from all accounts
            const allTransactions = accounts.map(a => a.transactions).flat();
            const transactions = Transactions.fromList(allTransactions);

            // Extract unique tags from budgets
            const budgets = transactions.getBudgets();
            this.availableTags = [...new Set(budgets.map(b => b.tag))].sort();

            console.log('TagsSelectorComponent: Available tags updated', this.availableTags);
        };

        // Initialize with current data
        update(this.accountsService.get());

        // Subscribe to future updates
        this.#accts = this.accountsService.subscribe(update);

        // Subscribe to tag changes with debouncing
        this.#tagSub = this.tagsChange.pipe(debounceTime(500)).subscribe(($event) => this.changed($event));
    }

    ngOnDestroy() {
        this.#accts?.unsubscribe();
        this.#tagSub?.unsubscribe();
    }

    changed($event: Tags) {
        console.log('TagsSelectorComponent: Tags changed', $event);
        this.onChange($event);
        this.onTouched();
        this.selected.emit($event);
    }

    // ControlValueAccessor implementation
    writeValue(value: Tags): void {
        // This is called when the ngModel value is set externally
        // We don't need to do anything here as the component manages its own state
    }

    registerOnChange(fn: (value: Tags) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
