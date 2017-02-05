#!/usr/bin/env python
# Reads current weather status from openweathermap. 
# 
import requests
import json

nconf = json.load(open("config.json"))
lat = nconf["weather"]["lat"]
lon = nconf["weather"]["lon"]
apikey = nconf["weather"]["apikey"]

url = "http://api.openweathermap.org/data/2.5/weather?lat=%s&lon=%s&lang=en&units=metric&APPID=%s" % (lat, lon, apikey)
r = requests.get(url)
j = r.json()
print(json.dumps({
    "temperature": j["main"]["temp"],
    "humidity": j["main"]["humidity"],
    "pressure": j["main"]["pressure"],
    "description": j["weather"][0]["description"]
}))
