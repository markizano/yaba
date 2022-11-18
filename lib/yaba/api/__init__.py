
import io, os
import json
import cherrypy

from kizano import getLogger
log = getLogger(__name__)

class ApiServer(object):

    @cherrypy.expose()
    def accounts(self, *args, **kwargs):
        '''
        Management of accounts.
        GET: List of accounts configured.
        POST: Create new account.
        DELETE: Remove an account.
        PUT: Update an account.
        @return (json). Results of the operation (success/fail, message).
        '''
        cherrypy.response.headers['Content-Type'] = 'application/json'
        return json.dumps({
            'accounts': [
                {
                    'id': '11111111',
                    'name': 'Hardcode Bank',
                    'institution': 'Hardcode Inst',
                }
            ]
        }).encode('UTF-8')

    @cherrypy.expose()
    def institutions(self, *args, **kwargs):
        '''
        Management of institutions.
        '''

    @cherrypy.expose()
    def transactions(self, *args, **kwargs):
        '''
        Management of transactions.
        '''
        cherrypy.response.headers['Content-Type'] = 'application/json'
        return json.dumps({
            'transactions': [
                {
                    'id': '0x0001',
                    'name': 'Google',
                    'accountId': '11111111',
                    'amount': 10.83,
                    'datePending': '2022-01-01',
                    'datePosted': '2022-01-03',
                    'description': 'Google Pay -> Google Inc.',
                    'tags': [
                        'business',
                        'entertainment',
                        'media'
                    ]
                },
                {
                    'id': '0x0002',
                    'name': 'Amazon',
                    'accountId': '11111111',
                    'amount': 93.49,
                    'datePending': '2022-01-04',
                    'datePosted': '2022-01-08',
                    'description': 'AWS Servers and Backups',
                    'tags': [
                        'business',
                        'essential'
                    ]
                },
                {
                    'id': '0x0003',
                    'name': 'Winco Foods',
                    'accountId': '11111111',
                    'amount': 75.89,
                    'datePending': '2022-01-14',
                    'datePosted': '2022-01-16',
                    'description': 'Winco Groceries',
                    'tags': [
                        'grocery',
                        'essential'
                    ]
                }
            ]
        }).encode('UTF-8')
        

    @cherrypy.expose()
    def settings(self, *args, **kwargs):
        '''
        Management of Settings.
        '''

class Server(object):
    '''
    Root object to contain the main API interface.
    '''

    def __init__(self):
        log.info('Starting Yaba...')
        cherrypy.response.headers['Access-Control-Allow-Origin'] = '*'
        cherrypy.response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        self.api = ApiServer()
        cherrypy.expose(self.api)

    def getConfig(self):
        '''
        Get static config for the API.
        '''
        return {
            'server.socket_host': os.getenv('SERVER_ADDRESS', '0.0.0.0'),
            'server.socket_port': os.getenv('SERVER_PORT', 8222),
            'error_page.404': self.index,
            'error_page.403': self.e403,
        }

    def getSiteConfig(self):
        '''
        Get static config for the server/cherrypy config.
        '''
        return {
            '/': {
                'tools.trailing_slash.on': False,
                'tools.staticdir.on': True,
                'tools.staticdir.dir': os.getenv('UI_PATH', os.path.realpath('public')),
                'tools.staticdir.content_types': { 'html': 'text/html; charset=UTF-8' }
            },
        }

    @cherrypy.expose
    def index(self, **kwargs):
        index_html = os.path.join( self.getSiteConfig()['/']['tools.staticdir.dir'], 'index.html' )
        return io.open(index_html, 'r').read()
    home = index
    accounts = index
    institutions = index
    settings = index
    budget = index

    @cherrypy.expose
    def e403(self, **kwargs):
        cherrypy.response.headers['Content-Type'] = 'application/json'
        return json.dumps({
            'error': 403,
            'message': 'method not accepted',
            'explain': 'That is an invalid operation. Please check your request before trying again.'
        })

    @cherrypy.expose
    def halt(self, **kwargs):
        cherrypy.engine.exit()
        return 'Shutting down...'

def main():
    '''
    Main application/API entry point.
    '''
    yaba = Server()
    cherrypy.config.update(yaba.getConfig())
    cherrypy.tree.mount(yaba, '/', yaba.getSiteConfig())
    cherrypy.engine.start()
    cherrypy.engine.block()
