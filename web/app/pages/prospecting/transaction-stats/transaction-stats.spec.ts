import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { TransactionStatsComponent } from './transaction-stats';
import { ProspectingModule } from 'app/pages/prospecting/prospecting.module';

describe('TxnStatsComponent', () => {
  let component: TransactionStatsComponent;
  let fixture: ComponentFixture<TransactionStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProspectingModule],
      providers: [provideHttpClient()]
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
