# Import the necessary package to process data in JSON format
try:
    import json
except ImportError:
    import simplejson as json

# Import the necessary methods from "twitter" library
from twitter import Twitter, OAuth, TwitterHTTPError, TwitterStream

# Variables that contains the user credentials to access Twitter API 
ACCESS_TOKEN = '4439885179-wWnObEBOeTTM8zN7Pk4Fy63wSRfl1JgXbljxhgo'
ACCESS_SECRET = 'abVQOALl0pMTF4778tm7ZqYrlnwl6hLSBQn9VrUr9YGTM'
CONSUMER_KEY = '5a4t0jyFd0GCQdRArDc7OLMFV'
CONSUMER_SECRET = 'FRWSz5YYStoMTWxPnAMruCU2L9s5enzm8eZbU2A3v7N0CfEog9'

oauth = OAuth(ACCESS_TOKEN, ACCESS_SECRET, CONSUMER_KEY, CONSUMER_SECRET)

twitter = Twitter(auth=oauth)

# http://www.woeidlookup.com/
sfo_trends = twitter.trends.place(_id = 2487956)

print(json.dumps(sfo_trends, indent=4))