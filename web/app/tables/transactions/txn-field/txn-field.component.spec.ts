import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TxnFieldComponent } from './txn-field.component';

describe('TxnFieldComponent', () => {
    let component: TxnFieldComponent;
    let fixture: ComponentFixture<TxnFieldComponent>;

    beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TxnFieldComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TxnFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    });

    it('should create', () => {
    expect(component).toBeTruthy();
    });
});
