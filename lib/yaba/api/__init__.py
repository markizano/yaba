
import io, os
import json
import cherrypy

from kizano import getLogger
log = getLogger(__name__)

from yaba.api.server import CRUD_Server, HardcodeServer

class Server(object):
    '''
    Root object to contain the main API interface.
    '''

    def __init__(self):
        log.info('Starting Yaba...')
        cherrypy.response.headers['Access-Control-Allow-Origin'] = '*'
        cherrypy.response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        if 'DEBUG' in os.environ:
            ApiServer = HardcodeServer
        else:
            ApiServer = CRUD_Server
        self.api = ApiServer()

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
    accounts = account = index
    institutions = index
    settings = index
    budget = index
    prospect = index
    charts = index

    @cherrypy.expose
    @cherrypy.tools.json_out()
    def e403(self, **kwargs):
        cherrypy.response.headers['Content-Type'] = 'application/json'
        return {
            'error': 403,
            'message': 'method not accepted',
            'explain': 'That is an invalid operation. Please check your request before trying again.'
        }

    @cherrypy.expose
    @cherrypy.tools.json_out()
    def halt(self, **kwargs):
        cherrypy.engine.exit()
        return {
            "message": "Shutting down..."
        }

def main():
    '''
    Main application/API entry point.
    '''
    yaba = Server()
    cherrypy.config.update(yaba.getConfig())
    cherrypy.tree.mount(yaba, '/', yaba.getSiteConfig())
    cherrypy.engine.start()
    cherrypy.engine.block()
