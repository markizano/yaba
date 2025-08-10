import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { InstitutionsService } from './institutions.service';
import { Institutions } from 'app/lib/institutions';

describe('InstitutionsService', () => {
    let service: InstitutionsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [InstitutionsService, provideHttpClient()]
        });
        service = TestBed.inject(InstitutionsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should allow subscriptions', () => {
        const sub = service.subscribe((institutions: Institutions) => {
            expect(institutions).toHaveClass('Institutions');
        });
        sub.unsubscribe();
    })
});
