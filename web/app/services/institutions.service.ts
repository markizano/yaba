import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { iStorables, BaseHttpService } from 'app/services/basehttp.service';
import { Institution, Institutions } from 'app/lib/institutions';

@Injectable({
    providedIn: 'root'
})
export class InstitutionsService extends BaseHttpService<Institution, Institutions> implements iStorables<Institutions> {
    readonly name = 'institutions';

    constructor(http: HttpClient) {
        super(http);
        console.log('new InstitutionsService()');
    }

    getEndpoint(): string {
        return '/api/institutions';
    }
}
