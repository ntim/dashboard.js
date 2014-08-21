var express = require('express');
var router = express.Router();
var hue = require("node-hue-api");
var request = require("request");
var util = require('util');

var username = "newdeveloper";
var host = null;
var api = null;

function discover() {
	hue.locateBridges().then(function(bridges) {
		if (bridges.length > 0) {
			host = bridges[0].ipaddress;
			api = new hue.HueApi(host, username);
		}
	}).done();
}

/* GET off page. */
router.get('/bridges', function(req, res) {
	hue.locateBridges().then(function(bridge) {
		res.json(bridge);
	}).done();
});

router.get('/lights', function(req, res) {
	var path = util.format("http://%s/api/%s/lights", host, username);
	request(path, function(error, response, lights) {
		if (error) {
			return res.json(error);
		}
		res.json(JSON.parse(lights));
	});
});

/* GET off page. */
router.get('/off', function(req, res) {
	var state = hue.lightState.create().off();
	api.lights(function(error, result) {
		var lights = result.lights;
		// Do the setting of the light sync since the bridge only accepts a few
		// concurrent connections.
		function set(i) {
			api.setLightState(lights[i].id, state, function(error, result) {
				if (error) {
					return res.json(error);
				}
				if (i + 1 < lights.length) {
					set(i + 1);
				} else {
					res.json({
						success : "off"
					});
				}
			});
		}
		set(0);
	});
});

/* GET off page. */
router.get('/on', function(req, res) {
	var state = hue.lightState.create().on();
	api.lights(function(error, result) {
		var lights = result.lights;
		// Do the setting of the light sync since the bridge only accepts a few
		// concurrent connections.
		function set(i) {
			api.setLightState(lights[i].id, state, function(error, result) {
				if (error) {
					return res.json(error);
				}
				if (i + 1 < lights.length) {
					set(i + 1);
				} else {
					res.json({
						success : "off"
					});
				}
			});
		}
		set(0);
	});
});

// TODO: discover on the raspberry pi yields in a timeout exception.
// discover();

module.exports = router;
