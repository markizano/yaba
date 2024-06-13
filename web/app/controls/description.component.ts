import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'yaba-description',
    templateUrl: './description.component.html',
    styles: [  ],
    standalone: true,
    imports: [ CommonModule, FormsModule ],

})
export class YabaFilterDescriptionComponent {
    @Input() description: string|RegExp;
    useRegexp: boolean;
    @Output() descriptionChange = new EventEmitter<string|RegExp>();

    constructor() {
        this.description = '';
        this.useRegexp = false;
    }

    changed(description: string|RegExp, useRegexp: boolean) {
        if ( useRegexp ) {
            this.descriptionChange.emit( new RegExp(description) );
        } else {
            this.descriptionChange.emit( description );
        }
    }
}
