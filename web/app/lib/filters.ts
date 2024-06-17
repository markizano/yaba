import { Transactions, Transaction } from "app/lib/transactions";


export class YabaFilters {

    static budgetBy() {
        return (transactions: Transactions, filterTags: string|string[]): Transaction[] => {
            if ( !transactions ) return transactions;
            if ( !filterTags ) return transactions;
            const result: Transaction[] = [], txnIds: string[] = [];
            transactions.forEach((transaction) => {
                if ( typeof filterTags == 'string' ) {
                    filterTags = filterTags.split(',');
                }
                filterTags.forEach((incomeTag) => {
                    if ( transaction.tags.includes(incomeTag.trim()) ) {
                        if ( !txnIds.includes(transaction.id) ) {
                            result.add(transaction);
                            txnIds.add(transaction.id);
                        }
                    }
                });
            })
            return result;
        };
    }

    static sortBy(sortAgent: SortAgent) {
        return (field: keyof Transaction & string) => {
            sortAgent.asc = sortAgent.column == field? !sortAgent.asc: true;
            sortAgent.column = field;
            return sortAgent;
        };
    }

}