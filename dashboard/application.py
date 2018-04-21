import json
import logging
import random

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

# This function returns a base geo json dictionary
def make_base_geojson():
    base_dict = {'features': [],
                 'properties': {'attribution': 'Traffic accidents: <a '
                                               'href="http://data.norge.no/data/nasjonal-vegdatabank-api" '
                                               'target="blank">NVDB</a>',
                                'description': 'Tweet and trend analysis',

                                'fields': {'5055': {'name': 'Date'},
                                           '5056': {'name': 'Tweet'},
                                           '5057': {'name': 'Trend'},
                                           '5058': {'name': 'TweetID'},
                                           '5059': {'name': 'User'},
                                           '5065': {'Sentiment': {'1': 'Pedestrian',
                                                               '2': 'Bicycle',
                                                               '3': 'Motorcycle',
                                                               '4': 'Car'},
                                                    'name': 'Sentiment'},
                                           '5074': {'lookup': {'1': 'Event',
                                                               '2': 'Sports',
                                                               '3': 'Politics',
                                                               '4': 'News',
                                                               '5': 'Technology',
                                                               '6': 'Business',
                                                               '7': 'Entertainment',
                                                               '8': 'Health'},
                                                    'name': 'Topic'}}},
                 'type': 'FeatureCollection'}
    return base_dict


def geoJsonify(raw_json):
    topic_map = {'Business': '6', 'Entertainment': '7', 'Event': '1', 'Health': '8',
                'News': '4', 'Politics': '3', 'Sports': '2', 'Technology': '5'}

    Date, Tweet, Topic = raw_json["creation_time"], raw_json["body"], raw_json["topic"]
    Trend, TweetID, User = raw_json["trend"], raw_json["twid"], raw_json["user"]
    try:
        location = raw_json["location"].split(",")
    except:
        return None
    coordinates = [float(location[1]), float(location[0])]

    single_marker = {'geometry': {'coordinates': [10.846302136575284,
                                                            59.8214648309797],
                                            'type': 'Point'},
                               'properties': {'5055': '2013-01-02', '5065': '4', '5074': '4'},
                               'type': 'Feature'}
    single_marker['geometry']['coordinates'] = coordinates
    single_marker['properties']['5055'] = Date.split('.')[0]
    single_marker['properties']['5056'] = Tweet
    single_marker['properties']['5057'] = Trend
    single_marker['properties']['5058'] = TweetID
    single_marker['properties']['5059'] = User
    if not Topic:
        Topic = random.choice(['Entertainment', 'Business', 'Health', 'News', 'Sports',
                               'Event', 'Politics', 'Technology'])
    single_marker['properties']['5074'] = topic_map[Topic]
    return single_marker.copy()


@app.route('/all_markers', methods=['GET','POST'])
def show_all_markers():
    # full_filename = os.path.join(app.config['UPLOAD_FOLDER'], 'shovon.jpg')
    cluster = Cluster()
    session = cluster.connect('graphy')
    rows = session.execute("SELECT json * FROM tweet")
    result = []
    for i in rows:
        raw_json = json.loads(i.json)
        geo_json = geoJsonify(raw_json)
        if geo_json:
            result.append(geo_json)
    base_geo_json = make_base_geojson()
    base_geo_json['features'] = result
    return Response(json.dumps(base_geo_json), mimetype='application/json')


@app.route('/color', methods=['POST'])
def show_color():
    color = request.form['color']
    return "Success"


if __name__ == '__main__':
   app.run()