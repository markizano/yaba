import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TxnRowComponent } from './txn-row.component';

describe('TxnRowComponent', () => {
    let component: TxnRowComponent;
    let fixture: ComponentFixture<TxnRowComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TxnRowComponent]
        })
        .compileComponents();
        
        fixture = TestBed.createComponent(TxnRowComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
