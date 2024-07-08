import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { NgSelectModule } from "@ng-select/ng-select";

import { Tags } from "app/lib/types";
import { debounceTime, Subject, Subscription } from "rxjs";

/**
 * I needed a way to take a list of budgets and filter them by the end-user's selection.
 * In this way, I can list the budgets and only fire an event containing the user's selections.
 */
@Component({
    selector: 'yaba-budgets, yaba-tags',
    templateUrl: './tags-filter.component.html',
    standalone: true,
    imports: [ CommonModule, FormsModule, NgSelectModule ],
})
export class TagsFilterComponent {
    @Input() tags = <Tags>[];
    tagsChange = new Subject<Tags>();
    #tagSub?: Subscription;
    @Output() selected = new EventEmitter<Tags>();

    ngOnInit() {
        // console.log('BudgetsFilterComponent().ngOnInit()');
        this.#tagSub = this.tagsChange.pipe(debounceTime(500)).subscribe(($event) => this.changed($event));
    }

    ngOnDestroy() {
        this.#tagSub?.unsubscribe();
    }

    changed($event: Tags) {
        // console.log('BudgetsFilterComponent().changed()', $event);
        this.selected.emit( $event );
    }
}
