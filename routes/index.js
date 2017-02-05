var express = require('express');
var router = express.Router();

const Influx = require('influx')
const influx = new Influx.InfluxDB({
	host: 'osmc',
	database: 'telegraf',
});

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Dashboard' });
});

module.exports = router;
