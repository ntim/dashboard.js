var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var compression = require('compression');

var index = require('./routes/index');
var weather = require('./routes/weather');
var departures = require('./routes/departures');
var query = require('./routes/query');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Compile less and js on the fly in development.
if (app.get('env') === 'development') {
	var less = require('less-middleware');
	var browserify = require('browserify-middleware');
	// less middleware
	app.use(less(path.join(__dirname, 'public')));
	// browserify middleware
	app.get('/js/bundle.js', browserify(path.join(__dirname, 'public', 'js', 'app.js'), {
	  cache: true,
	  precompile: true,
	}));
}
// configure static assets.
app.use(express.static(path.join(__dirname, 'public')));

// compression
app.use(compression());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Fonts.
app.use('/fonts', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/fonts')));
app.use('/fonts', express.static(path.join(__dirname, '/node_modules/font-awesome/fonts')));

// routes
app.use('/', index);
app.use('/weather', weather);
app.use('/departures', departures);
app.use('/query', query);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
