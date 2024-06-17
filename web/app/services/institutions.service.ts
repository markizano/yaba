import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BaseHttpService } from 'app/services/basehttp.service';
import { Institutions } from 'app/lib/institutions';

@Injectable({
    providedIn: 'root'
})
export class InstitutionsService extends BaseHttpService<Institutions> {
    readonly name = 'institutions';
    readonly endpoint = '/api/institutions';
    cache: Institutions;

    constructor(http: HttpClient) {
        super(http);
        console.log('new InstitutionsService()');
        this.cache = new Institutions();
    }

    next(value: Institutions): void {
        this.cache.add(...value);
        this.cacheExpiry = false;
    }
}
