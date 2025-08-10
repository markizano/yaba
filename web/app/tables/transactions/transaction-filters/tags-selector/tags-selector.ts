import { debounceTime, Subject, Subscription } from "rxjs";
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, forwardRef, inject } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

import { Tags } from "app/lib/types";
import { BudgetsService } from "app/services/budgets.service";

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
    budgetsService = inject(BudgetsService);

    // Local data
    availableTags: Tags = [];
    #tagSub?: Subscription;

    tagsChange = new Subject<Tags>();

    ngOnInit() {
        // Subscribe to budgets service to get available tags
        this.budgetsService.subscribe((tags: Tags) => {
            this.availableTags = tags;
            console.log('TagsSelectorComponent: Available tags updated', this.availableTags);
        });

        // Subscribe to tag changes with debouncing
        this.#tagSub = this.tagsChange.pipe(debounceTime(500)).subscribe(($event) => this.changed($event));
    }

    ngOnDestroy() {
        this.#tagSub?.unsubscribe();
    }

    changed($event: Tags) {
        console.log('TagsSelectorComponent: Tags changed', $event);
        this.onChange($event);
        this.onTouched();
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
