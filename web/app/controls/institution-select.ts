import { CommonModule } from "@angular/common";
import { Component, EventEmitter, forwardRef, inject, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from "@angular/forms";
import { NgSelectComponent } from "@ng-select/ng-select";
import { Institution, Institutions } from "app/lib/institutions";
import { InstitutionsService } from "app/services/institutions.service";
import { Subscription } from "rxjs";

/**
 * NgSelect front for selecting institution(s).
 */
@Component({
    selector: 'yaba-institution-select',
    templateUrl: './institution-select.html',
    imports: [
        CommonModule,
        FormsModule,
        NgSelectComponent,
    ],
    providers: [{ // Enables the use of [(ngModel)] to be passed to this component. (Binds to institutionId)
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => InstitutionSelectComponent),
        multi: true
    }]
})
export class InstitutionSelectComponent implements OnInit, OnDestroy, ControlValueAccessor {
    @Input() required = false;
    @Output() selected = new EventEmitter<Institution>();
    @Input() institutionId: string = '';

    onChange = (_: string) => {};
    onTouched = () => {};
    disabled = false;

    institutions = new Institutions();
    #sub?: Subscription;

    protected institutionsService = inject(InstitutionsService);

    ngOnInit() {
        const update = (institutions: Institutions) => {
            this.institutions = institutions;
        }
        update(this.institutionsService.get());
        this.#sub = this.institutionsService.subscribe(update);
    }

    ngOnDestroy() {
        this.#sub?.unsubscribe();
    }

    writeValue(value: string): void {
        this.institutionId = value;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
