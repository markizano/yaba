import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { BudgetingComponent } from './budgeting';
import { BudgetingModule } from './budgeting.module';

describe('BudgetingComponent', () => {
  let component: BudgetingComponent;
  let fixture: ComponentFixture<BudgetingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BudgetingModule],
      providers: [provideHttpClient()]
    });
    fixture = TestBed.createComponent(BudgetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
