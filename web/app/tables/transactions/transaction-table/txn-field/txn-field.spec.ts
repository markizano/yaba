import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { TxnFieldComponent } from './txn-field';
import { TransactionTableModule } from 'app/tables/transactions/transaction-table/transaction-table.module';

describe('TxnFieldComponent', () => {
    let component: TxnFieldComponent;
    let fixture: ComponentFixture<TxnFieldComponent>;

    beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TransactionTableModule],
    providers: [provideHttpClient()]
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
