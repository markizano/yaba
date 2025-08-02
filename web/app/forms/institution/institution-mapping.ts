import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { NgSelectable } from 'app/lib/types';
import { InstitutionMapping, MapTypes } from 'app/lib/institutions';
import { YabaAnimations } from 'app/lib/animations';
import { ITransaction } from 'app/lib/transactions';
import { ControlsModule } from 'app/controls/controls.module';


@Component({
  selector: 'yaba-institution-mapping',
  templateUrl: './institution-mapping.html',
  styleUrls: ['./institution-mapping.css'],
  standalone: true,
  animations: [
    YabaAnimations.fadeSlideDown()
  ],
  imports: [
    ControlsModule,
    MatIconModule,
  ],
})
export class InstitutionMappingComponent {
    @Input() index = 0;
    @Input() mapping = new InstitutionMapping();
    @Output() mappingChange = new EventEmitter<InstitutionMapping>();
    @Input() fields: NgSelectable<keyof ITransaction>[] = [];
    @Output() fieldsChange = new EventEmitter<void>();
    @Output() removeMapping = new EventEmitter<number>();

    protected _remove() {
        this.removeMapping.emit(this.index);
    }

    /**
     * When a field is selected, inform the parent Component so that it can update the related variable.
     * @param toFieldSelect
     */
    onToField(toFieldSelect: HTMLSelectElement) {
        this.mapping.toField = toFieldSelect.value as keyof ITransaction;
        this.mappingChange.emit(this.mapping);
        this.fieldsChange.emit();
    }

    isField() {
        return this.mapping.mapType == MapTypes.dynamic;
    }
}
