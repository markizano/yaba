import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
    selector: 'yaba-pagination',
    templateUrl: './pagination.component.html',
    standalone: true,
    imports: [ CommonModule, FormsModule, NgSelectModule ],
})
export class PaginationComponent {
    title = 'Pagination';
    @Input() itemCount = 0;
    itemsPerPage = 10;
    offset = 0;
    page = 1;
    pageCount = 1;

    constructor() {
        this.refresh();
    }

    setPage($page: number) {
        if ( $page < 0 || $page > this.pageCount -1 ) return;
        this.page = $page;
        this.offset = $page * this.itemsPerPage;
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
