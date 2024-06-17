import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BaseHttpService } from 'app/services/basehttp.service';
import { Institutions } from 'app/lib/institutions';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class InstitutionsService extends BaseHttpService<Institutions> {
    readonly name = 'institutions';
    readonly endpoint = '/api/institutions';
    cache: Institutions;
    override cacheSubject: BehaviorSubject<Institutions>;

    constructor(http: HttpClient) {
        super(http);
        this.cache = new Institutions();
        this.cacheSubject = new BehaviorSubject<Institutions>(this.cache);
        console.log('new InstitutionsService()');
        this.cacheSubject.subscribe((value) => this.next(value));
    }

    next(value: Institutions): void {
        this.flush();
        this.cache.add(...value);
        this.cacheExpiry = false;
        this.setExpire();
    }
}
