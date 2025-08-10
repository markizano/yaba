import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { TransactionSampleComponent } from './transaction-sample';
import { TransactionTableModule } from 'app/tables/transactions/transaction-table/transaction-table.module';

describe('TransactionSample', () => {
  let component: TransactionSampleComponent;
  let fixture: ComponentFixture<TransactionSampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionTableModule],
      providers: [provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionSampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
