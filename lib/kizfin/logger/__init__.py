
import sys
import logging
from logging.handlers import SysLogHandler

class LocalSyslogHandler(SysLogHandler):
    def emit(self, record):
        '''
        Takes a log message and breaks it out into multiple messages if it exceeds 64k for syslogger.
        '''
        maxlen = 2015 if sys.platform == 'darwin' else 65502
        mesg = record.getMessage()
        if len(mesg) > maxlen:
            while len(mesg) > maxlen:
                record.msg = mesg[0:maxlen]
                SysLogHandler.emit(self, record)
                mesg = mesg[maxlen:]
        else:
            SysLogHandler.emit(self, record)

def getLogger(name, log_level=logging.DEBUG):
    logger = logging.getLogger(name)
    logger.setLevel(log_level)
    logging.basicConfig(format='%(asctime)s %(name)s.%(funcName)s(PID=%(process)d, %(levelname)s) %(message)s')

    syslog_handler = LocalSyslogHandler()
    syslog_handler.setLevel(log_level)
    logger.addHandler(syslog_handler)

    return logger
