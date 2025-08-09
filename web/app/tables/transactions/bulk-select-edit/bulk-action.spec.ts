import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkAction } from './bulk-action';

describe('BulkAction', () => {
  let component: BulkAction;
  let fixture: ComponentFixture<BulkAction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkAction]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkAction);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
