#!/usr/bin/env python
import requests
import json

lat = 50.7765549
lon = 6.046465
apikey = None

url = "http://api.openweathermap.org/data/2.5/weather?lat=%s&lon=%s&lang=en&units=metric&APPID=%s" % (lat, lon, apikey)
r = requests.get(url)
j = r.json()
print(json.dumps({
    "temperature": j["main"]["temp"],
    "humidity": j["main"]["humidity"],
    "pressure": j["main"]["pressure"],
    "description": j["weather"][0]["description"]
}))
