var express = require('express');
var router = express.Router();
var http = require('http');
var moment = require('moment');
var fs = require('fs');
var glob = require('glob');
var util = require('util');
var later = require('later');
var dblite = require('dblite');
var db = dblite('temperatures.sqlite')

// Find all 1wire temperature devices.
var pattern = '/sys/bus/w1/devices/*/w1_slave';
var paths = glob.sync(pattern);
var last = [];

function db_create_if_not_exists(id) {
	db.query(util.format('CREATE TABLE IF NOT EXISTS `temp%d` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, '
			+ '`time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, `value` REAL)', id), function(error, rows) {
		if (error) {
			console.log(error);
		}
	});
}

function db_insert(id, value) {
	db.query(util.format('INSERT INTO `temp%d` (`value`) VALUES (?)', id), [value], function(error, rows) {
		if (error) {
			console.log(error);
		}
	});
}

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
			// Update table.
			if (data.celsius) {
				db_create_if_not_exists(index);
				db_insert(index, data.celsius);
			}
		});
	});
}

/* GET temperatures page. */
router.get('/', function(req, res) {
	res.json(last);
});

/* GET temperatures page. */
router.get('/all/:id', function(req, res) {
	db.query(util.format('SELECT * FROM `temp%d` ORDER BY `id` DESC LIMIT 256', req.params.id), function(err, rows) {
		if (err) {
			console.log(err);
			return res.json(err);
		}
		res.json(rows);
	});
});

// Update every 10 seconds
var schedule = later.parse.recur().every(10).second();
later.setInterval(update, schedule);

module.exports = router;
