import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TxnStatsComponent } from './txn-stats.component';

describe('TxnStatsComponent', () => {
  let component: TxnStatsComponent;
  let fixture: ComponentFixture<TxnStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TxnStatsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TxnStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
