var express = require('express');
var router = express.Router();
var hue = require("node-hue-api");

/* GET off page. */
router.get('/bridge', function(req, res) {
	hue.locateBridges().then(function(bridge) {
		res.json(bridge);
	}).done();
});

/* GET off page. */
router.get('/off', function(req, res) {
	var state = hue.lightState.create().off();
	hue.locateBridges().then(function(bridge) {
		var api = new HueApi(bridge.ipaddress, "newdeveloper");
		api.lights(function(err, lights) {
			if (err) {
				console.log(err);
				return;
			}
			lights.forEach(function(l) {
				api.setLightState(l.id, state, function(err, lights) {
					if (err) {
						console.log(err);
					}
				});
			});
		});
	}).done();
});

module.exports = router;
