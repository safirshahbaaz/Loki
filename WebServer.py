#!/usr/bin/env python3

import logging as log
import os
from threading import Lock
import socket
import datetime
import time
import uuid

import simplejson as json
import tornado.httpclient
import tornado.ioloop
import tornado.web
import tornado.websocket

class BaseHandler(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "Content-Type")
        self.set_header('Access-Control-Allow-Methods', ' POST, OPTIONS')

    def options(self):
        self.set_status(204)
        self.finish()

    def post(self):
        self.set_status(204)
        self.finish()

class MainHandler(BaseHandler):
    def get(self):
        log.info("MAIN")
        self.render("index.html")

class CreateEmergencyHandler(BaseHandler):
    @tornado.gen.coroutine
    def post(self):
        log.info(str(self.request.body, encoding='utf-8'))
        post_data = json.loads(str(self.request.body, encoding='utf-8'))
        response = None

        log.debug(post_data)

        try:
            marker = post_data['marker']
            emergency = post_data['emergency']

            timestamp = datetime.datetime.utcnow()
            timestamp = timestamp.strftime('%Y-%m-%dT%H:%M:%SZ')

            location = 'circle("%f,%f %f")' % (marker['latitude'], marker['longitude'], 1000)
            
            data = {
            "reportId": 'uuid("{0}")'.format(uuid.uuid4()),
            "severity": 1, 
            "impactZone": location,
            "timeoffset": time.time(),
            "timestamp": 'datetime("{0}")'.format(timestamp), 
            "duration": 900.0, 
            "message": emergency + " alert!", 
            "emergencyType": emergency}

            dataString = json.dumps(data)

            dataString = dataString.replace('"uuid(\\\"', 'uuid("')
            dataString = dataString.replace('"circle(\\\"', 'circle("')
            dataString = dataString.replace('\\\")"', '")')
            dataString = dataString.replace('"datetime(\\\"', 'datetime("')

            print(dataString)

            sock1 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

            iostream = tornado.iostream.IOStream(socket=sock1)
            yield iostream.connect(("promethium.ics.uci.edu", 10010))
            yield iostream.write(dataString.encode('utf-8'))

            iostream.close()
            sock1.close()

        except KeyError as e:
            log.info('Parse error for ' + str(e) + ' in ' + str(post_data))
            log.info(e.with_traceback())
            response = {'status': 'failed', 'error': 'Bad formatted request missing field ' + str(e)}

        self.write(json.dumps(response))
        self.flush()
        self.finish()

def start_server():
    settings = {
        "static_path": os.path.join(os.path.dirname(__file__), "static")
    }

    application = tornado.web.Application([
        (r'/', MainHandler),
        (r'/create', CreateEmergencyHandler)
    ], **settings)

    application.listen(16002)
    tornado.ioloop.IOLoop.current().start()
    
if __name__ == '__main__':
    start_server()