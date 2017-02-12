#!/usr/bin/env python3

import logging as log
import os
from threading import Lock
import socket
import datetime

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
        
        log.debug(post_data)

        try:
        	marker = post_data['marker']
        	emergency = post_data['emergency']

        	timestamp = datetime.datetime.utcnow()
			timestamp = timestamp.strftime('%Y-%m-%dT%H:%M:%SZ')
			location = 'circle(\"%f,%f %f\")' % (marker['latitude'], marker['longitude'], 1000)

			data = {
			"severity": 1, 
			"impactZone": location, 
			"timeoffset": timestamp, 
			"duration": 900.0, 
			"message": emergency + 'alert!', 
			"emergencyType": emergency}

			dataString = json.dumps(data)

			log.debug(dataString)

			sock1 = socket()
    		sock1.connect((128.195.52.76, 10001))

    		sock1.sendall(dataString.encode('utf-8'))
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

    application.listen(8989)
    tornado.ioloop.IOLoop.current().start()
    
if __name__ == '__main__':
    start_server()