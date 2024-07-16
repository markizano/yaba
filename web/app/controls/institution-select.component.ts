import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Institutions } from "app/lib/institutions";
import { InstitutionsService } from "app/services/institutions.service";
import { Subscription } from "rxjs";

/**
 * NgSelect front for selecting institution(s).
 */
@Component({
    selector: 'institution-select',
    templateUrl: './institution-select.component.html',
})
export class InstitutionSelectComponent {
    @Input() multiple = false;
    @Input() required = false;
    @Output() selected = new EventEmitter<string[]|string>();
    institutions = new Institutions();
    #sub?: Subscription;
    constructor(protected institutionsService: InstitutionsService) { }
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
