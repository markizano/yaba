import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

import { MapTypes, IMapping } from 'app/lib/institutions';
import { TransactionFields } from 'app/lib/transactions';


@Component({
    selector: 'mapping',
    templateUrl: './mapping.component.html',
    animations: [
        trigger('slide-down', [ 
          transition('void => *', [
            style({ height: 0 }), 
            animate(600, style({height: '*'}))
          ]) 
        ])
    ]
})
export class MappingComponent {
    @Input() public mapping?: IMapping;
    @Input() public index: number;
    @Output() public removeMapping: EventEmitter<IMapping>;
    public TransactionFields = TransactionFields;
    public MapTypes = MapTypes;

    constructor() {
        this.index = 0;
        if ( ! this.mapping ) {
            this.mapping = {
                fromField: '',
                toField: TransactionFields.UNKNOWN,
                mapType: MapTypes.static,
            };
        }
        this.removeMapping = new EventEmitter<IMapping>();
    }

    /**
     * Remove the mapping from the institution. Notification event for the parent.
     * @param mapping The mapping we wish to remove. Notify the parent component.
     */
    public rmMap(mapping: IMapping|undefined): void {
        if ( this.removeMapping && mapping ) {
            this.removeMapping.emit(mapping);
        }
    }
}
