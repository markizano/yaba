import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { YabaComponent } from 'app/yaba';
import { routeConfig } from 'app/routing';

bootstrapApplication(YabaComponent, {
  providers: [
    provideRouter(routeConfig),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
  ],
}).catch(err => {
  console.log('Global handler');
  console.error(err);
});
