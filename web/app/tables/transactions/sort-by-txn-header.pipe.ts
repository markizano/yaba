import { Pipe, PipeTransform } from '@angular/core';
import { YabaFilters } from 'app/lib/filters';

@Pipe({
  name: 'sortByTxnHeader',
  standalone: true,
})
export class SortByTxnHeaderPipe implements PipeTransform {

  transform(value: Array<unknown>): Array<unknown> {
    return value.sort(YabaFilters.sortBy({ column: 'datePosted', asc: true }));
  }

}
