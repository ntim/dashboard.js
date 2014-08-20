var express = require('express');
var router = express.Router();
var request = require('request');
var jsdom = require("jsdom");
var fs = require("fs");
var jquery = fs.readFileSync("./public/js/jquery.min.js", "utf-8");

/* GET departures page. */
router.get('/', function(req, res) {
	// Parse canteen website of the RWTH Aachen.
	jsdom.env({
		url : 'http://speiseplan.studentenwerk-aachen.de/mensa/tg_mensa_vita.std.php',
		// Inject jquery.
		src : [jquery],
		done : function(errors, window) {
			if(errors) {
				console.log(errors);
				return res.json([]);
			}
			var $ = window.$;
			// Get dish name and price.
			var dishes = $("table.tag_std tbody tr.btw td:nth-child(2)");
			var prices = $("table.tag_std tbody tr.btw td:nth-child(3)");
			var result = [];
			for (var i = 0; i < Math.min(dishes.length, prices.length); i++) {
				try {
					result.push({
						dish : $(dishes[i]).contents().get(0).nodeValue,
						price : $(prices[i]).contents().get(0).nodeValue.trim()
					});
				} catch (e) {
					console.log(e);
					console.log($(dishes[i]).html());
					console.log($(prices[i]).html());
					continue;
				}
			}
			res.json(result);
		}
	});
});

module.exports = router;
