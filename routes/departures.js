var express = require('express');
var router = express.Router();
var request = require('request');
var moment = require('moment');
var util = require('util');

/* GET departures page. */
router.get('/', function(req, res) {
	// Request departures from the ASEAG, a public transport organization in
	// Aachen.
	// Request stop id -> stop name via
	// http://ivu.aseag.de/interfaces/ura/instant_V1?ReturnList=stopid,stoppointname
	// var stopId = 100629; // "Campus melaten"
	var stopId = 100008; // "Augustastrasse"
	var path = util.format('/interfaces/ura/instant_V1?StopID=%d'
			+ '&ReturnList=StopPointName,LineName,DestinationName,EstimatedTime', stopId);
	request('http://ivu.aseag.de' + path, function(error, response, body) {
		if (error) {
			console.log(error);
			return res.json({});
		}
		var lines = body.split("\r\n");
		// Remove first line.
		lines.shift();
		// Current time in milliseconds.
		var t0 = moment().valueOf();
		// Parse response.
		lines = lines.map(function(e) {
			// Convert each line to a JSON object.
			var j = JSON.parse(e);
			// Convert timestamp to estimated arrival time in seconds.
			j[4] -= t0;
			j[4] /= 1000.0;
			return {
				eta : j[4],
				line : j[2],
				destination : j[3]
			};
		});
		// Remove busses already departed.
		lines = lines.filter(function(e) {
			return e.eta >= 0;
		});
		// Sort remaining by eta ASC.
		lines.sort(function(a, b) {
			return a.eta - b.eta;
		});
		res.json(lines);
	});
});

module.exports = router;
