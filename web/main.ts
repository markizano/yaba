import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { YabaModule } from 'app/yaba.module';

platformBrowserDynamic()
  .bootstrapModule(YabaModule)
  .catch(err => {console.log('Global handler'); console.error(err)});
