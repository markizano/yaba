// @Source: https://gist.github.com/darrenmothersele/7afda13d858a156ce571510dd78b7624
import { Directive, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';

// Angular Drag and Drop File
//
// Add this directive to an element to turn it into a dropzone
// for drag and drop of files.
// Example:
//
// <div (yabaDropFile)="fileDrop($event)"></div>
//
// Any files dropped onto the region are then
// returned as a Javascript array of file objects.
// Which in TypeScript is `Array<File>`
//

@Directive({
    standalone: true,
    selector: '.dropfile',
})
export class YabaDropFileDirective {

    // The directive emits a `drop` event
    // with the list of files dropped on the element
    // as an JS array of `File` objects.
    @Output() drop = new EventEmitter<File[]>();

    // Disable dropping on the body of the document. 
    // This prevents the browser from loading the dropped files
    // using it's default behaviour if the user misses the drop zone.
    // Set this input to false if you want the browser default behaviour.
    @Input() preventBodyDrop = true;

    active = false;

    // The `drop-zone-active` class is applied to the host
    // element when a drag is currently over the target.
    @HostBinding('class') get classes(): string {
        return this.active ? 'drop-zone-active' : '';
    }

    @HostListener('drop', ['$event'])
    onDrop(event: DragEvent) {
        console.debug('> drop', event);
        if ( typeof event.preventDefault !== 'undefined')
            event.preventDefault();
        this.active = false;

        const dataTransfer = <DataTransfer>event?.dataTransfer;
        const files: File[] = [];

        if ( dataTransfer !== null && dataTransfer !== undefined) {
            if ( dataTransfer.items !== null && dataTransfer.items !== undefined ) {
                for (let i = 0; i < dataTransfer.items.length; i++) {
                    // If dropped items aren't files, reject them
                    if (dataTransfer.items[i].kind === 'file') {
                        const file = dataTransfer.items[i].getAsFile();
                        if ( file !== null && file !== undefined)
                            files.push(file);
                    }
                }
                dataTransfer.items.clear();
            } else {
                files.push(...Array.from(dataTransfer.files));
                dataTransfer.clearData();
            }
            this.drop.emit(files);
        }
    }

    @HostListener('dragover', ['$event'])
    onDragOver(event: DragEvent) {
        if ( typeof event.preventDefault !== 'undefined')
            event.preventDefault();
        this.active = true;
        // console.log('dragover', event);
    }

    @HostListener('dragleave', ['$event'])
    onDragLeave(event: DragEvent) {
        if ( typeof event.preventDefault !== 'undefined')
            event.preventDefault();
        this.active = false;
        // console.log('dragleave', event);
    }

    @HostListener('body:dragover', ['$event'])
    onBodyDragOver(event: DragEvent) {
        // console.log('body:dragover(stub)', event);
        if (this.preventBodyDrop) {
            if ( typeof event.preventDefault !== 'undefined')
                event.preventDefault();
                // event.stopPropagation();
        }
    }

    @HostListener('body:drop', ['$event'])
    onBodyDrop(event: DragEvent) {
        // console.log('body:drop(stub)', event);
        if (this.preventBodyDrop) {
            if ( typeof event.preventDefault !== 'undefined')
                event.preventDefault();
            }
    }
}
