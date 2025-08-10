import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { InstitutionsComponent } from 'app/pages/institutions/institutions';
import { InstitutionsModule } from './institutions.module';

describe('InstitutionsComponent', () => {
  let component: InstitutionsComponent;
  let fixture: ComponentFixture<InstitutionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InstitutionsModule],
      providers: [provideHttpClient()]
    });
    fixture = TestBed.createComponent(InstitutionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
