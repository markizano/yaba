import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevelopComponent } from 'app/pages/develop/develop';

describe('DebugComponent', () => {
  let component: DevelopComponent;
  let fixture: ComponentFixture<DevelopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevelopComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevelopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
