import { Pipe, PipeTransform } from '@angular/core';
import { YabaFilters } from 'app/lib/filters';

@Pipe({
  name: 'sortByTxnHeader',
  standalone: true,
})
export class SortByTxnHeaderPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]) {
    if ( args.length > 0 ) {
      return YabaFilters.sortBy({ column: value, asc: !args[0] });
    }
    return YabaFilters.sortBy({ column: value, asc: true });
  }

}
