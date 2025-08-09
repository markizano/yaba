
# Transaction Table

This is the transaction table component.
It contains only what is required in order to render a list of transactions in the table.

It may contain the bells and whistles for modifying transactions and the actions column.

However, those are strictly input and output events and data points and do not connect
with the global singleton services.

I have to stop the scope here as this does not contain any of:

- The transaction filter components.
- Bulk edits
- Budgeting
- The account or transaction editing itself (in the services or the session)

The only way transactions are edited is if they are enabled for modification,
changed via the user interface, and if the save button is clicked, this component
will issue the event with the updated values instead of saving to the service.

This component also includes the capacity to paginate.
