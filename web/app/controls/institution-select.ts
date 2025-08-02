import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from "@angular/core";
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
        NgSelectComponent
    ],
})
export class InstitutionSelectComponent implements OnInit, OnDestroy {
    @Input() required = false;
    @Output() selected = new EventEmitter<Institution>();
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
}
