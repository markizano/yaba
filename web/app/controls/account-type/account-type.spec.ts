import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountTypesComponent } from './account-type';
import { ControlsModule } from '../controls.module';

describe('AccountType', () => {
  let component: AccountTypesComponent;
  let fixture: ComponentFixture<AccountTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlsModule]
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
