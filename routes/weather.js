var express = require('express');
var router = express.Router();
var request = require('request');
var moment = require('moment');
var util = require('util');

/* GET weather data. */
router.get('/', function(req, res) {
	// Read data from the weather station at the physics institute in Aachen.
	var path = util.format('/wetterstation/%d/%s.txt', moment().year(), moment().format('YYYY.MM.DD'));
	request('http://wwwdbac.physik.rwth-aachen.de' + path, function(error, response, body) {
		if (error) {
			console.log(error);
			return res.json({});
		}
		var lines = body.split("\r\n");
		// Get last line (last update).
		var last = lines[lines.length - 2].split(" ");
		res.json({
			temperature : parseFloat(last[6]),
			humidity : parseFloat(last[12]),
			pressure : parseFloat(last[21]),
			rain : parseFloat(last[24])
		});
	});
});

/* GET open weather map data. */
router.get('/openweathermap', function(req, res) {
	// Read data from the weather station at the physics institute in Aachen.
	var lat = 50.7765549;
	var lon = 6.046465;
	var path = util.format('/data/2.5/weather?lat=%s&lon=%s&lang=en&units=metric', lat, lon);
	request('http://api.openweathermap.org/' + path, function(error, response, body) {
		if (error) {
			console.log(error);
			return res.json({});
		}
		var data = JSON.parse(body);
		res.json({
			temperature : data.main.temp,
			humidity : data.main.humidity,
			pressure : data.main.pressure,
			rain : "-",
			description : data.weather[0].description
		});
	});
});

module.exports = router;
