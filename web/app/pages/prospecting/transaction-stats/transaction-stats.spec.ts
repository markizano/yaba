import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionStatsComponent } from './txn-stats';

describe('TxnStatsComponent', () => {
  let component: TransactionStatsComponent;
  let fixture: ComponentFixture<TransactionStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
