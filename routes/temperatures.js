var express = require('express');
var router = express.Router();
var http = require('http');
var moment = require('moment');
var fs = require('fs');
var glob = require('glob');
var later = require('later');

// Find all 1wire temperature devices.
var pattern = '/sys/bus/w1/devices/*/w1_slave';
var paths = glob.sync(pattern);
var last = [];

function read(path, callback) {
	// Read device file contents.
	fs.readFile(path, 'utf8', function(err, data) {
		var res = {
			path : path,
			celsius : null,
			fahrenheit : null
		};
		if (err) {
			return callback(res);
		}
		// Find temperature.
		var matches = data.match(/t=([0-9]+)/);
		res.celsius = parseInt(matches[1]) / 1000;
		res.fahrenheit = ((res.celsius * 1.8) + 32).toFixed(3);
		callback(res);
	});
}

function update() {
	// Delete previous objects.
	last = [];
	// Read temperature from all devices.
	paths.forEach(function(path, index, array) {
		read(path, function(data) {
			last.push(data);
		});
	});
}

/* GET temperatures page. */
router.get('/', function(req, res) {
	res.json(last);
});

// Update every 10 seconds
var schedule = later.parse.recur().every(10).second();
later.setInterval(update, schedule);

module.exports = router;
