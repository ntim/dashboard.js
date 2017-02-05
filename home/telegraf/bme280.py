#!/usr/bin/env python
from Adafruit_BME280 import *
import json

sensor = BME280(mode=BME280_OSAMPLE_8)

degrees = sensor.read_temperature()
pascals = sensor.read_pressure()
hectopascals = pascals / 100
humidity = sensor.read_humidity()

print(json.dumps({"temperature": degrees, "humidity": humidity, "pressure": hectopascals}))
