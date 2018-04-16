import json
import logging
from flask_cors import CORS
from flask import Flask, render_template, request, url_for, Response
import os, json
from cassandra.cluster import Cluster
from cassandra.cqlengine import connection

PEOPLE_FOLDER = os.path.join('static', 'people_photo')

app = Flask(__name__, static_url_path='')

cors = CORS(app, resources={r"/*": {"origins": "*"}})
# app.config['UPLOAD_FOLDER'] = PEOPLE_FOLDER

@app.route('/')
@app.route('/index')
def show_index():
    # full_filename = os.path.join(app.config['UPLOAD_FOLDER'], 'shovon.jpg')
    # return render_template("index.html")
    return app.send_static_file('./index.html')

# def patch_broken_pipe_error():
#     """Monkey Patch BaseServer.handle_error to not write
#     a stacktrace to stderr on broken pipe.
#     http://stackoverflow.com/a/22618740/362702"""
#     import sys
#     from SocketServer import BaseServer
#     from wsgiref import handlers
#
#     handle_error = BaseServer.handle_error
#     log_exception = handlers.BaseHandler.log_exception
#
#     def is_broken_pipe_error():
#         type, err, tb = sys.exc_info()
#         return repr(err) == "error(32, 'Broken pipe')"
#
#     def my_handle_error(self, request, client_address):
#         if not is_broken_pipe_error():
#             handle_error(self, request, client_address)
#
#     def my_log_exception(self, exc_info):
#         if not is_broken_pipe_error():
#             log_exception(self, exc_info)
#
#     BaseServer.handle_error = my_handle_error
#     handlers.BaseHandler.log_exception = my_log_exception
#
#
# patch_broken_pipe_error()

def make_geojson(rows):
    base_dict = {'features': [{'geometry': {'coordinates': [10.846302136575284,
                                                            59.8214648309797],
                                            'type': 'Point'},
                               'properties': {'5055': '2013-01-02', '5065': '4', '5074': '4'},
                               'type': 'Feature'},
                              {'geometry': {'coordinates': [10.844189879731648,
                                                            59.82613401648146],
                                            'type': 'Point'},
                               'properties': {'5055': '2013-01-13', '5065': '4', '5074': '4'},
                               'type': 'Feature'},
                              {'geometry': {'coordinates': [10.865008671234968,
                                                            59.92920757221595],
                                            'type': 'Point'},
                               'properties': {'5055': '2013-10-06', '5065': '4', '5074': '4'},
                               'type': 'Feature'}],
                 'properties': {'attribution': 'Traffic accidents: <a '
                                               'href="http://data.norge.no/data/nasjonal-vegdatabank-api" '
                                               'target="blank">NVDB</a>',
                                'description': 'Traffic accidents in 2013 in Oslo, Norway',
                                'fields': {'5055': {'name': 'Date'},
                                           '5065': {'lookup': {'1': 'Pedestrian',
                                                               '2': 'Bicycle',
                                                               '3': 'Motorcycle',
                                                               '4': 'Car'},
                                                    'name': 'Accident type'},
                                           '5074': {'lookup': {'1': 'Fatal',
                                                               '2': 'Very serious injuries',
                                                               '3': 'Serious injuries',
                                                               '4': 'Minor injuries',
                                                               '5': 'No injuries',
                                                               '6': 'Not recorded'},
                                                    'name': 'Injuries'}}},
                 'type': 'FeatureCollection'}

    pass

@app.route('/all_markers', methods=['GET','POST'])
def show_all_markers():
    # full_filename = os.path.join(app.config['UPLOAD_FOLDER'], 'shovon.jpg')
    cluster = Cluster()
    session = cluster.connect('test01')
    rows = session.execute("SELECT json * FROM Classified_Tweets")
    result = []
    for i in rows:
        result.append(json.loads(i.json))
    return Response(json.dumps(result), mimetype='application/json')


@app.route('/color', methods=['POST'])
def show_color():
    color = request.form['color']
    return "Success"


if __name__ == '__main__':
   app.run()