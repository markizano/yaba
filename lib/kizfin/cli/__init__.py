# kizfin.cli

from argparse import ArgumentParser, RawTextFormatter

# Gather your controllers/modules to run. (why do I feel like this is a dumb pattern?)
import kizfin.cli.refresh
import kizfin.cli.balance
import kizfin.cli.tag
import kizfin.cli.category

class KizFinCli(object):
    '''
    Command line entrypoint into the application.
    This is a router object that will parse command line arguments into this object.
    Allows for expansion into heirarchial controllers if we decide to expand on
    sub-commands.
    '''

    DESCRIPTION = 'Kizano Finance CLI: Manage your Finanaces!'
    USAGE = '''
Usage: kizfin [command] [arguments]
Where [command] is one of:
- refresh: go fetch data from data sources and update indexes as needed.
- balance: Show balances across accounts.
- tag: Tag a transaction with a specific label.
- category: Update the category of a transaction.

    '''

    @staticmethod
    def main():
        '''
        Create object instance and parse arguments to kick off the router.
        Route commands to child controllers that will produce data points for
        rendering.
        '''
        parser = ArgumentParser(description=KizFinCli.DESCRIPTION, help=kizfin.USAGE)
        parser.add_argument(
          '--action', '-a',
          action='store_true',
          target
        )

