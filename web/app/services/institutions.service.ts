import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BaseHttpService } from 'app/services/basehttp.service';
import { Institutions } from 'app/lib/institutions';

@Injectable({
    providedIn: 'root'
})
export class InstitutionsService extends BaseHttpService<Institutions> {
    readonly name = 'institutions';
    readonly endpoint = '/api/institutions';
    protected cache: Institutions;
    protected cacheSubject: EventEmitter<Institutions>;

    constructor(http: HttpClient) {
        super(http);
        this.cache = new Institutions();
        this.cacheSubject = new EventEmitter<Institutions>();
        this.load().subscribe((value: Institutions) => this.next(value));
        console.log('new InstitutionsService()');
    }

    next(value: Institutions): void {
        // console.log('InstitutionsService().next(): ', value);
        this.cache = Institutions.fromList(value);
        this.cacheExpiry = false;
        this.setExpire();
        this.cacheSubject.emit(this.cache);
    }
}
