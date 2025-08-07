# Transaction Filters

This is the parent component for all things related to the transaction filters.

- **Daterange**: Filters by date. You have "from" and "to" date.
- **Account**: Filter by account(s) selected. This is an optional filter that is only applicable if given a list of dates to filter.
- **Description**: String or Regular Expression based searching of transactions. For every key pressed, should send a change event.
- **Budget/Tag Selector**: Filter transactions based on discovered budgets. This inputs an array of tags and outputs an event for every selection.

This parent component will combine the effects and events of all child components and the module exports everything to be available to the application.
