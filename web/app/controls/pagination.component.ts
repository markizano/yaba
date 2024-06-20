import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { PageTurn } from 'app/lib/types';


@Component({
    selector: 'yaba-pagination',
    templateUrl: './pagination.component.html',
    standalone: true,
    imports: [ CommonModule, FormsModule, NgSelectModule ],
})
export class PaginationComponent {
    title = 'Pagination';
    @Input() itemCount = 0;
    @Output() itemCountChange = new EventEmitter<number>(); // two-way bind to get the parent to notify this component when it updates.
    itemsPerPage = 10;
    offset = 0;
    page = 1;
    pageCount = 1;
    pages: number[] = [];
    @Output() turnPage = new EventEmitter<PageTurn>();

    constructor() {
        this.itemCountChange.subscribe(() => {
            this.refresh();
        });
    }

    ngOnInit() {
        this.refresh();
    }

    setPage($page: number) {
        if ( $page < 0 || $page > this.pageCount -1 ) return;
        this.page = $page;
        this.offset = $page * this.itemsPerPage;
        this.pages = Array.from(Array(this.pageCount).keys());
        this.turnPage.emit({ page: this.page, offset: this.offset, itemsPerPage: this.itemsPerPage });
    }

    previous() {
        this.setPage(this.page -1);
    }

    proximo() {
        this.setPage(this.page +1);
    }

    refresh() {
        this.pageCount = Math.round( this.itemCount / this.itemsPerPage );
        if ( this.itemCount >= this.itemsPerPage ) {
            this.pageCount += 1;
        }
        this.setPage(0);
    }

    keyNavigate($event: KeyboardEvent) {
        // Right
        if ( $event.key == 'ArrowRight' ) {
            $event.preventDefault();
            this.proximo();
        // Left
        } else if ( $event.key == 'ArrowLeft') {
            $event.preventDefault();
            this.previous();
        }
    }
}
