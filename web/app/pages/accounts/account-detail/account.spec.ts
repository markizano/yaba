import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountDetailComponent } from './account.component';

describe('AccountComponent', () => {
  let component: AccountDetailComponent;
  let fixture: ComponentFixture<AccountDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccountDetailComponent]
    });
    fixture = TestBed.createComponent(AccountDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
