import { SortByTxnHeaderPipe } from './sort-by-txn-header.pipe';

describe('SortByTxnHeaderPipe', () => {
  it('create an instance', () => {
    const pipe = new SortByTxnHeaderPipe();
    expect(pipe).toBeTruthy();
  });
});
