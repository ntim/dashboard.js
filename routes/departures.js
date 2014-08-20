var express = require('express');
var router = express.Router();
var http = require('http');
var moment = require('moment');
var util = require('util');

/* GET departures page. */
router.get('/', function(req, res) {
	http.request({
		host : 'ivu.aseag.de',
		path : '/interfaces/ura/instant_V1?StopID=100629&ReturnList=StopPointName,LineName,DestinationName,EstimatedTime'
	}, function(response) {
		var content = "";
		response.on('data', function(chunk) {
			content += chunk;
		});
		response.on('end', function() {
			var lines = content.split("\r\n");
			lines.shift();
			// Current time in milliseconds.
			var t0 = moment().valueOf();
			lines = lines.map(function(e){
				var j = JSON.parse(e);
				// Convert timestamp to estimated arrival time in seconds.
				j[4] -= t0;
				j[4] /= 1000.0;
				return {
					eta: j[4],
					line: j[2],
					destination: j[3]
				};
			});
			lines = lines.filter(function(e) {
				return e.eta >= 0;
			});
			lines.sort(function(a, b) {
				return a.eta - b.eta;
			});
			res.json(lines);
		});
	}).end();
});

module.exports = router;
