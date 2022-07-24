
import os, sys, io
from argparse import ArgumentParser, RawTextHelpFormatter

class KizFinCli(object):
    '''
    Command line entrypoint into the application.
    This is a router object that will parse command line arguments into this object.
    Allows for expansion into heirarchial controllers if we decide to expand on
    sub-commands.
    '''

    DESCRIPTION = 'Kizano\x27s Finance: Manage your Finanaces!'
    USAGE = '''
Where [command] is one of:
- new-account: Create and start tracking a new Account.
- refresh: go fetch data from data sources and update indexes as needed.
- balances: Show balances across accounts.
- tag: Tag a transaction with a specific label or overwrite existing tags.
- importcsv: Import a CSV file from a bank with a set of transactions to the DB.

new-account:
  --account-id [ACCOUNT_ID] The numeric account ID given by the bank to identify
    this account.
  --routing [ROUTING_NUMBER] The numeric routing number associated with your bank.
    This is usually public information.
  --name [NAME] Some label or descriptor for this account. Displayed in all places
    that represent this account.
  --institution [INSTITUTION] Bank, brokerage or holder of account custody.
  --slug [SLUG] Unique human-identifier for this account.
  --interest-rate [RATE] If this is an interest-bearing account, describe the
    rate here as a floating point decimal number as a percent.
    Example: 1.05%% interest would be represented as --interest-rate=1.05
  --interest-strategy [STRATEGY] (default=simple(daily)). Specify the type of interest
    strategy that is calculated against this account and the rate at which it is applied.
  --account-type [TYPE] Will this be checking, savings, brokerage, [roth|traditional] ira,
    crypto type of account?

refresh:
  The strategy behind this command is to go to each institution and ask them for the
  latest data. A workaround until then is to search for CSV files downloaded by the user
  prior to running this command.
  As drivers are installed and ability to communicate with Banks-Over-API's is available,
  we would rely less on end-user having to go download a CSV of their transactions every
  time they wanted to see an update here.

balances:
  The strategy behind this command is to simply iterate all accounts and display balances
  across accounts.

tag:
  --transaction-id [TXID] The ID/slug of the transaction in question.
  --name [NAME] The name of the tag to associate with this transaction.
  --value [VALUE] The string value to associate with the transaction.
    Blindly overwrites previous value if it existed.

importcsv:
  The strategy behind this command is to upload CSV files into the system for tracking.
  All transactions will be written to the DB if they don't exist there already.
  Duplicates will be skipped.
  Upon creating an account, the field mapping will be established, so no need
  to decide on what fields are what anatomy parts of the transaction. Just import and go!
  --account-id [ACCOUNT_ID] The target account that will receive updates from this
    CSV import.
  --csv-file [FILE_PATH] Location to the CSV file on disk to import.

    '''

    def parseArguments(self):
        '''
        Parse command line arguments into an object we can use.
        Multiple commands can yield different results.
        '''
        kfparser = ArgumentParser(description=KizFinCli.USAGE, formatter_class=RawTextHelpFormatter)
        kfparser.add_argument(
            '--config', '-c',
            action='store',
            dest='config',
            default=os.path.join(os.getenv('HOME'), '.config', 'kizfin.conf'),
            help='Override the default configuration file to load.'
        )
        subprogs = kfparser.add_subparsers()

        new_account = subprogs.add_parser('new-account', description='Creates a new account to track for transactions.')
        new_account.add_argument(
            '--account-id',
            action='store',
            dest='accountId',
            help='Account ID associated with this institution.',
            required=True
        )
        new_account.add_argument(
            '--routing', '--routing-number',
            action='store',
            dest='routing',
            help='Bankers Routing Number associated with this institution.',
        )
        new_account.add_argument(
            '--name',
            action='store',
            dest='name',
            help='Display name that will be rendered for this account.',
        )
        new_account.add_argument(
            '--slug',
            action='store',
            dest='slug',
            help='Human-readable unique name for this account. Only alphanumeric (A-Z, 0-9, _) characters.',
            required=True
        )
        new_account.add_argument(
            '--institution',
            action='store',
            dest='institution',
            help='Name of the bank or broker custody of this account.',
        )
        new_account.add_argument(
            '--interest-rate',
            action='store',
            type=float,
            dest='interestRate',
            metavar='INTEREST_RATE',
            help='Interest rate associated with this account be it checking/savings or credit card.',
        )
        new_account.add_argument(
            '--interest-strategy',
            action='store',
            choices=('simple', 'compound'),
            dest='interestStrategy',
            metavar='INTEREST_STRATEGY',
            default='simple',
            help='Simple or compound interest calculation strategy.',
        )
        new_account.add_argument(
            '--type', '--account-type',
            action='store',
            choices=('checking', 'savings', 'broker', 'ira-roth', 'ira-traditional', 'crypto',
              'loan', 'loc', 'credit'),
            dest='accountType',
            help='Type of account to consider. Some operations and transaction types are only available to certain account types.',
        )

        refresh = subprogs.add_parser(
          'refresh',
          description='Refresh the DB with the source where transactions are uploaded and ensure we are up to date.'
        )
        # Takes no arguments.

        balances = subprogs.add_parser(
            'balances',
            description='Show all balances across all configured accounts.'
        )
        # Takes no arguments.

        tag = subprogs.add_parser('tags', description='Associate tags with a transaction.')
        tag.add_argument(
            '--transaction-id', '--txid',
            action='store',
            dest='txid',
            help='Transaction ID to attach this tag.',
            required=True,
        )
        tag.add_argument(
            '--name',
            action='store',
            dest='name',
            help='Name of the tag to associate.',
            required=True,
        )
        tag.add_argument(
            '--value',
            action='store',
            dest='value',
            help='Value of the tag to associate',
            required=True,
        )

        importcsv = subprogs.add_parser('importcsv', description='Import/sync a CSV file into an account.')
        importcsv.add_argument(
            '--account-id',
            action='store',
            dest='accountId',
            help='Account ID that will receive this CSV import.',
            required=True,
        )
        importcsv.add_argument(
            '--csv-file',
            action='store',
            dest='filename',
            help='Location of the CSV file on disk to load.',
            required=True,
        )

        return kfparser.parse_args()

    @staticmethod
    def main():
        '''
        Create object instance and parse arguments to kick off the router.
        Route commands to child controllers that will produce data points for
        rendering.
        '''
        import json
        kf = KizFinCli()
        options = kf.parseArguments()
        print(json.dumps(options.__dict__, indent=2))
        return 0
