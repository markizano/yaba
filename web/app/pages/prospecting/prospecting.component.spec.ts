import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProspectingComponent } from './prospecting.component';

describe('ProspectingComponent', () => {
  let component: ProspectingComponent;
  let fixture: ComponentFixture<ProspectingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProspectingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProspectingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
