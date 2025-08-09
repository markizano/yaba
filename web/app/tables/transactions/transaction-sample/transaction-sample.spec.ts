import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionSampleComponent } from './transaction-sample';

describe('TransactionSample', () => {
  let component: TransactionSampleComponent;
  let fixture: ComponentFixture<TransactionSampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionSampleComponent]
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
