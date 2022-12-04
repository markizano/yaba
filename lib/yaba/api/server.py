
import os
import json
import cherrypy as cp
import random

from datetime import datetime
from yaba.adapters.mdb import MongoDriver
from yaba.models.account import Account, AccountCollection
from yaba.models.transaction import Transaction, TransactionCollection
from yaba.models.institution import Institution, InstitutionCollection

from kizano.logger import getLogger
log = getLogger(__name__)

from pprint import pprint

class CRUD_Server:
    '''
    API Server Endpoint you can query for updates.
    This is intended to be a thin moderated layer on top of MongoDB.

    /api/${CALL}:
    -- GET: Get a single transaction. By primary key.
    -- POST: Create a new transaction. Must include full data structure.
    -- DELETE: Remove a transaction by primary key.
    /api/${CALL}s:
    -- GET: Get multiple transactions filtered by the submitted payload.
    -- POST: Bulk-update transactions via upsert. Must send full payload back.
    -- DELETE: Remove multiple transactions from the storage backend.

    ${CALL} must be one of:
    - transaction
    - account
    - institution    
    '''

    SUPPORTED_API = [
        'institution',
        'account',
        'transaction'
    ]

    def __init__(self):
        log.info('Gathering configs and connecting to DB...')
        cp.response.headers['Access-Control-Allow-Origin'] = '*'
        cp.response.headers['Access-Control-Allow-Headers'] = 'Accept, Content-Type'
        self.db = MongoDriver().db
        log.info('\x1b[36mConnected!\x1b[0m')
        for model in CRUD_Server.SUPPORTED_API:
            setattr(self, model, self.single)
        for model in CRUD_Server.SUPPORTED_API:
            setattr(self, model + 's', self.batch)

    def getBody(self):
        if hasattr(cp.request, 'json'):
            return cp.request.json
        try:
            result = ''
            for line in cp.request.body.readlines(4096):
                if not line: continue
                result += line.decode('utf-8')
            return json.loads( result )
        except json.decoder.JSONDecodeError:
            return {}

    @cp.expose()
    @cp.tools.json_in()
    @cp.tools.json_out()
    def single(self):
        '''
        WHen calling on `/api/${CALL}` where ${CALL} in (account, transaction, institution).
        '''
        func = os.path.basename( cp.request.path_info )
        if func not in CRUD_Server.SUPPORTED_API:
            # I raise an exception here because this really is a developer issue.
            # cp will match what we provided via the function names. If other names are being
            # called here, we might have bigger issues.
            raise ValueError(f'Invalid request for {func}')
        collection = self.db[func + 's']
        search = self.getBody()
        log.debug('\x1b[34mQuery\x1b[0m: %s' % search)
        api2model = {
            'account': Account,
            'transaction': Transaction,
            'institution': Institution
        }

        if cp.request.method == 'GET':
            query = {}
            if 'id' in search:
                query['_id'] = search['id']
            for searchId in ['accountId', 'institutionId']:
                if searchId in search:
                    query[searchId] = search[searchId]

            document = collection.find_one(query) or {}
            model = api2model[func]
            result = model(document['_id'], **document)
            # import pdb; pdb.set_trace()
            return { func: result.jsonable() }
        elif cp.request.method == 'POST':
            log.warn('POST')

    @cp.expose()
    @cp.tools.json_in()
    @cp.tools.json_out()
    def batch(self):
        '''
        When calling on `/api/${CALL}s where ${CALL} in (account, transaction, institutions).
        '''
        func = os.path.basename( cp.request.path_info )
        if func.rstrip('s') not in CRUD_Server.SUPPORTED_API:
            # I raise an exception here because this really is a developer issue.
            # cp will match what we provided via the function names. If other names are being
            # called here, we might have bigger issues.
            raise ValueError(f'Invalid request for {func}')
        collection = self.db[func]
        search = self.getBody()
        log.debug('\x1b[34mQuery\x1b[0m: %s' % search)
        api2model = {
            'accounts': AccountCollection,
            'transactions': TransactionCollection,
            'institutions': InstitutionCollection
        }

        if cp.request.method == 'GET':
            query = {}
            if 'id' in search:
                query['_id'] = search['id']
            for searchId in ['accountId', 'institutionId']:
                if searchId in search:
                    query[searchId] = search[searchId]

            log.debug('Query: %s' % query)
            documents = list( collection.find(query) ) or [{}]
            models = api2model[func]
            results = models(documents)
            log.debug(f'DB Response: {documents}')
            # import pdb; pdb.set_trace()
            return { func: results.jsonable() }
        elif cp.request.method == 'POST':
            log.warn('POST')

    @cp.expose()
    @cp.tools.json_out()
    def default(self):
        return {
            'status': 404,
            'message': "I am pretty sure I don't work here."
        }

class HardcodeServer(object):
    '''
    API Server that will act as our main way of handling/passing off data to the front-end/client.
    '''

    @cp.expose()
    @cp.tools.json_out()
    def accounts(self, *args, **kwargs):
        '''
        Management of accounts.
        GET: List of accounts configured.
        POST: Create new account.
        DELETE: Remove an account.
        PUT: Update an account.
        @return (json). Results of the operation (success/fail, message).
        '''
        return {
            'accounts': [
                {
                    'id': '11111111',
                    'name': 'Hardcode Bank',
                    'institution': 'Hardcode Inst',
                    'description': 'My Hardcoded bank. This is a static response.',
                    'balance': 109.84
                },
                {
                    'id': '22222222',
                    'name': 'Hardcode Bank 2',
                    'institution': 'Hardcode Inst',
                    'description': 'My Hardcoded bank number 2. This is also a static response.',
                    'balance': 1112.12
                },
                {
                    'id': '555_555',
                    'name': 'Hardcode Bank #%d' % (random.random() * 100),
                    'institution': 'Hardcode Inst',
                    'description': 'My Hardcoded bank with a random number. This is a dynamic response.',
                    'balance': 3.98
                }
            ]
        }

    @cp.expose()
    @cp.tools.json_out()
    def institutions(self, *args, **kwargs):
        '''
        Management of institutions.
        '''
        return {
            'institutions': [
                {
                    'name': 'JPMC',
                    'description': 'JPMC Credit Card',
                    'mappings': [
                        {
                            'mapType': 'static',
                            'fromField': 'USD',
                            'toField': 'currency'
                        },
                        {
                            'mapType': 'dynamic',
                            'fromField': 'Date Posted',
                            'toField': 'datePosted'
                        },
                        {
                            'mapType': 'dynamic',
                            'fromField': 'Date Pending',
                            'toField': 'datePending'
                        },
                        {
                            'mapType': 'dynamic',
                            'fromField': 'Amount',
                            'toField': 'amount'
                        },
                        {
                            'mapType': 'dynamic',
                            'fromField': 'Memo',
                            'toField': 'description'
                        },
                        {
                            'mapType': 'dynamic',
                            'fromField': 'Summary',
                            'toField': 'name'
                        }
                    ]
                },
                {
                    'name': 'BoA',
                    'description': 'BoA Checking',
                    'mappings': [
                        {
                            'mapType': 'static',
                            'fromField': 'USD',
                            'toField': 'currency'
                        },
                        {
                            'mapType': 'dynamic',
                            'fromField': 'Transaction Date',
                            'toField': 'datePosted'
                        },
                        {
                            'mapType': 'dynamic',
                            'fromField': 'Pend Date',
                            'toField': 'datePending'
                        },
                        {
                            'mapType': 'dynamic',
                            'fromField': 'Amount',
                            'toField': 'amount'
                        },
                        {
                            'mapType': 'dynamic',
                            'fromField': 'Notes',
                            'toField': 'description'
                        },
                        {
                            'mapType': 'dynamic',
                            'fromField': 'Transaction',
                            'toField': 'name'
                        }
                    ]
                }
            ]
        }

    @cp.expose()
    @cp.tools.json_out()
    def transactions(self, *args, **kwargs):
        '''
        Management of transactions.
        '''
        return {
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
                },
                {
                    'id': '0x0004',
                    'name': 'Payroll',
                    'accountId': '11111111',
                    'amount': 1023.84,
                    'datePending': '2022-01-15',
                    'datePosted': '2022-01-16',
                    'description': 'Day Job Payroll',
                    'tags': [
                        'income'
                    ]
                }
            ]
        }

    @cp.expose()
    @cp.tools.json_in()
    @cp.tools.json_out()
    def settings(self, *args, **kwargs):
        '''
        Management of Settings.
        '''
        from pprint import pformat
        body = cp.request.json
        log.info( 'body: %s' % body )
        #log.info( 'body: %s' % '\n'.join([x.decode('utf-8') for x in cp.request.body.readlines() ]) )
        return {}



'''
{
  "__module__": "cp._cprequest",
  "__doc__": "An HTTP request.\n\n    This object represents the metadata of an HTTP request message;\n    that is, it contains attributes which describe the environment\n    in which the request URL, headers, and body were sent (if you\n    want tools to interpret the headers and body, those are elsewhere,\n    mostly in Tools). This 'metadata' consists of socket data,\n    transport characteristics, and the Request-Line. This object\n    also contains data regarding the configuration in effect for\n    the given URL, and the execution plan for generating a response.\n    ",
  "prev": null,
  "local": "httputil.Host('', 8222, '0.0.0.0')",
  "remote": "httputil.Host('127.0.0.1', 48310, '')",
  "scheme": "http",
  "server_protocol": "HTTP/1.1",
  "base": "http://localhost:8222",
  "request_line": "POST /api/settings?qsa=true&json\"hello\":\"world\" HTTP/1.1",
  "method": "POST",
  "query_string": "qsa=true&json\"hello\":\"world\"",
  "query_string_encoding": "utf8",
  "protocol": [
    1,
    1
  ],
  "params": {
    "qsa": "true",
    "json\"hello\":\"world\"": "",
    "{\"html\": \"body\", \"hello\": \"world\"}": ""
  },
  "header_list": [
    [
      "Remote-Addr",
      "127.0.0.1"
    ],
    [
      "HOST",
      "localhost:8222"
    ],
    [
      "USER-AGENT",
      "curl/7.74.0"
    ],
    [
      "ACCEPT",
      "*/*"
    ],
    [
      "Content-Type",
      "application/x-www-form-urlencoded"
    ],
    [
      "Content-Length",
      "34"
    ]
  ],
  "headers": {
    "Remote-Addr": "127.0.0.1",
    "Host": "localhost:8222",
    "User-Agent": "curl/7.74.0",
    "Accept": "*/*",
    "Content-Type": "application/x-www-form-urlencoded",
    "Content-Length": "34"
  },
  "cookie": {},
  "rfile": "<cheroot.server.KnownLengthRFile object at 0x7fa445683ca0>",
  "process_request_body": true,
  "methods_with_bodies": [
    "POST",
    "PUT",
    "PATCH"
  ],
  "body": "<cp._cpreqbody.RequestBody object at 0x7fa4456838b0>",
  "dispatch": "<cp._cpdispatch.Dispatcher object at 0x7fa4458ddd90>",
  "script_name": "",
  "path_info": "/api/settings",
  "login": null,
  "app": "cp._cptree.Application(<yaba.api.Server object at 0x7fa446a08490>, '')",
  "handler": "<cp.lib.encoding.ResponseEncoder object at 0x7fa4445dab50>",
  "toolmaps": {
    "tools": {
      "log_tracebacks": {
        "on": true
      },
      "log_headers": {
        "on": true
      },
      "trailing_slash": {
        "on": false
      },
      "encode": {
        "on": true
      },
      "staticdir": {
        "on": true,
        "dir": "/home/markizano/git/markizano/yaba/public",
        "content_types": {
          "html": "text/html; charset=UTF-8"
        },
        "section": "/"
      },
      "json_out": {
        "on": true
      }
    }
  },
  "config": {
    "tools.log_tracebacks.on": true,
    "tools.log_headers.on": true,
    "tools.trailing_slash.on": false,
    "tools.encode.on": true,
    "server.socket_host": "0.0.0.0",
    "server.socket_port": 8222,
    "error_page.404": "<bound method Server.index of <yaba.api.Server object at 0x7fa446a08490>>",
    "error_page.403": "<bound method Server.e403 of <yaba.api.Server object at 0x7fa446a08490>>",
    "tools.staticdir.on": true,
    "tools.staticdir.dir": "/home/markizano/git/markizano/yaba/public",
    "tools.staticdir.content_types": {
      "html": "text/html; charset=UTF-8"
    },
    "tools.staticdir.section": "/",
    "tools.json_out.on": true
  },
  "is_index": false,
  "hooks": {
    "on_start_resource": [],
    "before_request_body": [],
    "before_handler": [
      "cp._cprequest.Hook(callback=<class 'cp.lib.encoding.ResponseEncoder'>, failsafe=False, priority=70, )",
      "cp._cprequest.Hook(callback=<bound method HandlerTool._wrapper of <cp._cptools.HandlerTool object at 0x7fa445932490>>, failsafe=False, priority=50, dir='/home/markizano/git/markizano/yaba/public', content_types={'html': 'text/html; charset=UTF-8'}, section='/')",
      "cp._cprequest.Hook(callback=<function json_out at 0x7fa445a62ca0>, failsafe=False, priority=30, )"
    ],
    "before_finalize": [],
    "on_end_resource": [],
    "on_end_request": [],
    "before_error_response": [
      "cp._cprequest.Hook(callback=<function log_traceback at 0x7fa445a4e040>, failsafe=False, priority=50, )",
      "cp._cprequest.Hook(callback=<function log_request_headers at 0x7fa445a4e0d0>, failsafe=False, priority=50, )"
    ],
    "after_error_response": []
  },
  "error_response": "<bound method HTTPError.set_response of HTTPError(500, None)>",
  "error_page": {
    "404": "<bound method Server.index of <yaba.api.Server object at 0x7fa446a08490>>",
    "403": "<bound method Server.e403 of <yaba.api.Server object at 0x7fa446a08490>>"
  },
  "show_tracebacks": true,
  "show_mismatched_params": true,
  "throws": [
    "<class 'KeyboardInterrupt'>",
    "<class 'SystemExit'>",
    "<class 'cp._cperror.InternalRedirect'>"
  ],
  "throw_errors": false,
  "closed": false,
  "stage": "handler",
  "unique_id": "592bac8f-8a9b-408d-a20d-e87daae75db7",
  "namespaces": {
    "hooks": "<function hooks_namespace at 0x7fa44592c940>",
    "request": "<function request_namespace at 0x7fa4458664c0>",
    "response": "<function response_namespace at 0x7fa445866550>",
    "error_page": "<function error_page_namespace at 0x7fa4458665e0>",
    "tools": "<cp._cptools.Toolbox object at 0x7fa4459321c0>"
  },
  "__init__": "<function Request.__init__ at 0x7fa445866700>",
  "close": "<function Request.close at 0x7fa445866790>",
  "run": "<function Request.run at 0x7fa445866820>",
  "respond": "<function Request.respond at 0x7fa4458668b0>",
  "_do_respond": "<function Request._do_respond at 0x7fa445866940>",
  "process_query_string": "<function Request.process_query_string at 0x7fa4458669d0>",
  "process_headers": "<function Request.process_headers at 0x7fa445866a60>",
  "get_resource": "<function Request.get_resource at 0x7fa445866af0>",
  "handle_error": "<function Request.handle_error at 0x7fa445866b80>",
  "__dict__": "<attribute '__dict__' of 'Request' objects>",
  "__weakref__": "<attribute '__weakref__' of 'Request' objects>",
  "multithread": true,
  "multiprocess": false,
  "wsgi_environ": {
    "ACTUAL_SERVER_PROTOCOL": "HTTP/1.1",
    "PATH_INFO": "/api/settings",
    "QUERY_STRING": "qsa=true&json\"hello\":\"world\"",
    "REMOTE_ADDR": "127.0.0.1",
    "REMOTE_PORT": "48310",
    "REQUEST_METHOD": "POST",
    "REQUEST_URI": "/api/settings?qsa=true&json\"hello\":\"world\"",
    "SCRIPT_NAME": "",
    "SERVER_NAME": "0.0.0.0",
    "SERVER_PROTOCOL": "HTTP/1.1",
    "SERVER_SOFTWARE": "cp/18.8.0 Cheroot/8.6.0 Server",
    "wsgi.errors": "<_io.TextIOWrapper name='<stderr>' mode='w' encoding='utf-8'>",
    "wsgi.input": "<cheroot.server.KnownLengthRFile object at 0x7fa445683ca0>",
    "wsgi.input_terminated": false,
    "wsgi.multiprocess": false,
    "wsgi.multithread": true,
    "wsgi.run_once": false,
    "wsgi.url_scheme": "http",
    "wsgi.version": [
      1,
      0
    ],
    "SERVER_PORT": "8222",
    "HTTP_HOST": "localhost:8222",
    "HTTP_USER_AGENT": "curl/7.74.0",
    "HTTP_ACCEPT": "*/*",
    "CONTENT_TYPE": "application/x-www-form-urlencoded",
    "CONTENT_LENGTH": "34"
  },
  "args": [],
  "kwargs": {},
  "_json_inner_handler": "<cp._cpdispatch.LateParamPageHandler object at 0x7fa445683bb0>"
}

'''
