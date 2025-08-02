import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstitutionFormComponent } from './institution-form';

describe('InstitutionFormComponent', () => {
  let component: InstitutionFormComponent;
  let fixture: ComponentFixture<InstitutionFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InstitutionFormComponent]
    });
    fixture = TestBed.createComponent(InstitutionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
