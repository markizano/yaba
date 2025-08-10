import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { BulkAction } from './bulk-action';
import { BulkActionModule } from './bulk-action.module';

describe('BulkAction', () => {
  let component: BulkAction;
  let fixture: ComponentFixture<BulkAction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkActionModule],
      providers: [provideNoopAnimations()]
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
