import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { ControlsModule } from 'app/controls/controls.module';
import { YabaAnimations } from 'app/lib/animations';

@Component({
    selector: 'tag-txns',
    templateUrl: './txn-tag.component.html',
    animations: [ YabaAnimations.fadeSlideDown() ],
    standalone: true,
    imports: [
        ControlsModule,
    ]
})
export class TagTransactionsComponent {
    @Output() tags = new EventEmitter<string>();
    @Output() cancel = new EventEmitter<void>();
    listening = false;
    name = '';

    @HostListener('click', ['$event'])
    onClick($event: MouseEvent): void {
        if ( typeof $event.preventDefault !== 'undefined' ) {
            $event.preventDefault();
            $event.stopPropagation();
        }
        if ( this.listening ) { return; }
        this.listening = true;
    }

    checkInput(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.confirm(this.name);
        } else if (event.key === 'Escape') {
            this.cancelForm();
        }
    }

    confirm(tag: string) {
        console.log('tagged: ', tag);
        this.tags.emit(tag);
        this.listening = false;
    }

    cancelForm() {
        console.log('TagTransactionComponent.cancel()');
        this.listening = false;
        this.cancel.emit();
    }
}
