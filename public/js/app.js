
// Remember if the load event already fired.
angular.element(window).bind('load', function() {
	window._loaded = true;
});

angular.module('app', []).controller('clock', ['$scope', function($scope) {
	$(".clock").knob();
	function update() {
		// Update datetime widget.
		var hour = moment().hour();
		if (hour > 12) {
			hour -= 12.0;
		}
		$(".clock.hour").val(hour).trigger("change");
		$(".clock.minute").val(moment().minute()).trigger("change");
		$(".clock.second").val(moment().second()).trigger("change");
		$scope.time = moment().format('HH:mm');
		$scope.datetime = moment().format('DD.MM.YYYY');
		$scope.$apply();
	}
	// Update every second.
	setInterval(update, 1000);
}]).controller('weather', ['$scope', function($scope) {
	$scope.temperature = "-";
	$scope.humidity = "-";
	$scope.pressure = "-";
	$scope.rain = "-";
	function update() {
		$.get("/weather", function(j) {
			$scope.temperature = j.temperature;
			$scope.humidity = j.humidity;
			$scope.pressure = j.pressure;
			$scope.rain = j.rain;
			$scope.$apply();
		});
	}
	// Update every hour.
	setInterval(update, 60 * 1000);
	update();
}]).controller('departures', ['$scope', function($scope) {
	$scope.departures = [];
	function update() {
		$.get("/departures", function(j) {
			// Only display the first twelve entries.
			j = j.slice(0, 12);
			j = j.map(function(d) {
				if (d.eta < 60.0) {
					d.eta = "now";
				} else {
					// Convert seconds into minutes.
					d.eta = Math.round(d.eta / 60.0) + " m";
				}
				return d;
			});
			$scope.departures = j;
			$scope.$apply();
		});
	}
	// Update every 10 seconds.
	setInterval(update, 10000);
	update();
}]).directive("chart", ['$window',
function($window) {
	return {
		restrict : 'E',
		replace : false,
		link : function(scope, element, attrs) {
			var height = 116;
			var colors = ["#375a7f", "#217dbb", "#00bc8c", "#007053"];
			var offset = parseFloat(attrs.offset);
			var range = parseFloat(attrs.range);
			// Get chart element.
			var chart = d3.select(element[0]);
			var width = function() {
				return Math.ceil(chart.node().parentNode.getBoundingClientRect().width);
			};
			// 
			var format_value = function(value) {
				var format = d3.format(".1f");
				// Apply offset to compensate centering.
				return format(value + offset) + attrs.unit;
			};
			// Compute step function
			var step = function() {
				var selection = $('#span-select .active input')[0];
				var period = parseInt(selection.getAttribute('period'));
				return period / width() * 1000.0;
			}
			// Metric function
			var metric = function(start, stop, step, callback) {
				var influx_format = 'YYYY-MM-DD HH:mm:ss.SSSS';
				d3.json("/query/" 
						+ attrs.table + "/" 
						+ attrs.field + "/" 
						+ moment(start).utc().format(influx_format) + "/" 
						+ moment(stop).utc().format(influx_format) + "/" 
						+ (step / 1000).toFixed(0) + "s", function(data) {
					if (!data) {
						return callback(new Error("unable to load data"));
					}
					var values = data.map(function(d) {
						if (d.value == null) {
							return NaN;
						}
						// Values are centered around offset.
						return d.value - offset;
					});
					callback(null, values);
				});
			};
			// Setup horizon.
			var context = cubism.context().serverDelay(10 * 1000).step(step()).size(width());
			var init = function() {
				chart.call(function(div) {
					div.datum(context.metric(metric, ""));
					div.append("div").attr("class", "horizon").call(
						// Display range of values.
						context.horizon().height(height).mode("offset").extent([-range, range]).colors(colors).format(format_value)
					);
					div.append("div").attr("class", "axis").call(context.axis().orient("bottom"));
				});
			}
			// Check if dom already present.
			if ($window._loaded) {
				init();
			} else {
				angular.element($window).bind('load', function() {
					init();
				});
			}
			// Listen to changes in size.
			angular.element($window).bind('resize', function() {
				context.stop();
				context.step(step()).size(width());
				context.start();
			});
			$('#span-select label').click(function() {
				context.stop();
				$('#span-select label').removeClass('active');
				$(this).addClass('active');
				context.step(step()).size(width());
				context.start();
			});
		}
	};
}]);;
