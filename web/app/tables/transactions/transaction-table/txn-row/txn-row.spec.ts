import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { TxnRowComponent } from './txn-row';
import { TransactionTableModule } from 'app/tables/transactions/transaction-table/transaction-table.module';

describe('TxnRowComponent', () => {
    let component: TxnRowComponent;
    let fixture: ComponentFixture<TxnRowComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TransactionTableModule],
            providers: [provideHttpClient()]
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
