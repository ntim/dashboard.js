var express = require('express');
var router = express.Router();
var request = require('request');
var moment = require('moment');
var util = require('util');

var nconf = require('nconf');
// Then load configuration from a designated file.
nconf.file({ file: 'config.json' });
// Provide default values for settings not provided above.
nconf.defaults({
	'weather' : {
		'apikey' : "",
		'lat': 50.7765549,
		'lon': 6.046465
	}
});

/* GET open weather map data. */
router.get('/', function(req, res) {
	// Read data from the weather station at the physics institute in Aachen.
	var lat = nconf.get('weather:lat');
	var lon = nconf.get('weather:lon');
	// TODO from config
	var apikey = nconf.get('weather:apikey');
	var path = util.format('/data/2.5/weather?lat=%s&lon=%s&lang=en&units=metric&APPID=%s', lat, lon, apikey);
	console.log(path);
	request('http://api.openweathermap.org/' + path, function(error, response, body) {
		if (error) {
			console.log(error);
			return res.json({});
		}
		try {
			var data = JSON.parse(body);
			res.json({
				temperature : data.main.temp,
				humidity : data.main.humidity,
				pressure : data.main.pressure,
				rain : "-",
				description : data.weather[0].description
			});
		} catch (error) {
			console.log(error);
			res.json({});
		}
	});
});

module.exports = router;
