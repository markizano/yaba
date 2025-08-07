import { debounceTime, Subject, Subscription } from "rxjs";

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";

import { Tags } from "app/lib/types";

/**
 * I needed a way to take a list of budgets and filter them by the end-user's selection.
 * In this way, I can list the budgets and only fire an event containing the user's selections.
 */
@Component({
    selector: 'yaba-budgets, yaba-tags',
    standalone: false,
    templateUrl: './tags-selector.html',
    styleUrls: ['./tags-selector.css'],
})
export class TagsSelectorComponent implements OnInit, OnDestroy {
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
