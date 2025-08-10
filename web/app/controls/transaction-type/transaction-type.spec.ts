import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionTypeComponent } from './transaction-type';
import { ControlsModule } from 'app/controls/controls.module';

describe('TransactionType', () => {
  let component: TransactionTypeComponent;
  let fixture: ComponentFixture<TransactionTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
