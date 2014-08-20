var express = require('express');
var router = express.Router();
var http = require('http');
var moment = require('moment');
var util = require('util');

/* GET weather page. */
router.get('/', function(req, res) {
	// Read data from the weather station at the physics institute in Aachen.
	http.request({
		host : 'wwwdbac.physik.rwth-aachen.de',
		path : util.format('/wetterstation/%d/%s.txt', moment().year(), moment().format('YYYY.MM.DD'))
	}, function(response) {
		var content = "";
		response.on('data', function(chunk) {
			content += chunk;
		});
		response.on('end', function() {
			var lines = content.split("\r\n");
			// Get last line (last update).
			var last = lines[lines.length - 2].split(" ");
			res.json({
				temperature : parseFloat(last[6]),
				humidity : parseFloat(last[12]),
				pressure : parseFloat(last[21]),
				rain : parseFloat(last[24])
			});
		});
	}).end();
});

module.exports = router;
