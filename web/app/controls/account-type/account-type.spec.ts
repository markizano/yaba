import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountTypesComponent } from './account-type';

describe('AccountType', () => {
  let component: AccountTypesComponent;
  let fixture: ComponentFixture<AccountTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
