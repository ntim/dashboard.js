var express = require('express');
var router = express.Router();

const Influx = require('influx')
const influx = new Influx.InfluxDB({
	host: 'osmc',
	database: 'telegraf',
});

router.get('/:table/:field/:start/:step', function(req, res, next) {
	var query = 'SELECT mean("' + req.params['field'] + 
		'") AS "value" FROM "telegraf"."autogen"."' + req.params['table'] + 
		'" WHERE time > now() - ' + req.params['start'] + 
		' GROUP BY time(' + req.params['step'] + ')';
	console.log(query);
	influx.query(query).then(result => {
		res.json(result)
	}).catch(err => {
		console.log(err);
		res.status(500).send(err.stack)
	})
});

module.exports = router;
