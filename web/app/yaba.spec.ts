import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { YabaComponent } from 'app/yaba';

describe('YabaComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [YabaComponent],
    providers: [provideRouter([])]
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(YabaComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render menu component', () => {
    const fixture = TestBed.createComponent(YabaComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('yaba-menu')).toBeTruthy();
  });
});
