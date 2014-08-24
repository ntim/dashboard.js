function trim(str, max) {
	if (str.length > max) {
		str = str.substring(0, max - 1) + "...";
	}
	return str;
}

function temperatures_chart() {
	$.get("/temperatures/all/0", function(data) {
		data.forEach(function(d) {
			d.time = Date.parse(d.time);
		});
		var width = 320, height = 160;
		var x = d3.time.scale().range([ 0, width ]);
		var y = d3.scale.linear().range([ height, 0 ]);
		var xAxis = d3.svg.axis().scale(x).orient("top").tickFormat(
				d3.time.format("%H:%Mh")).ticks(5);
		var yAxis = d3.svg.axis().scale(y).orient("right").ticks(3).tickFormat(
				function(d) {
					return d + " \u00B0C";
				});
		var area = d3.svg.area().x(function(d) {
			return x(d.time);
		}).y0(height).y1(function(d) {
			return y(d.value);
		});
		var svg = d3.select("#temperatures-chart").append("svg").attr("width",
				width).attr("height", height);
		x.domain(d3.extent(data, function(d) {
			return d.time;
		}));
		var y_extent = d3.extent(data, function(d) {
			return d.value;
		});
		var dy = Math.max(2.0, (y_extent[1] - y_extent[0]) * 0.25);
		y.domain([ y_extent[0] - dy, y_extent[1] + dy ]);
		svg.append("path").datum(data).attr("class", "area").attr("fill",
				"rgba(64, 127, 183, 0.33)").attr("stroke", "none").attr("d", area);
		svg.append("g").attr("class", "x axis").attr("fill",
				"rgba(64, 127, 183, 1)").attr("transform",
				"translate(0," + (height + 1) + ")").call(xAxis);
		svg.append("g").attr("class", "y axis").attr("fill",
				"rgba(64, 127, 183, 1)").call(yAxis);
		setInterval(function() {
			$.get("/temperatures/all/0", function(data) {
				// Update graph.
				data.forEach(function(d) {
					d.time = Date.parse(d.time);
				});
				svg.selectAll("path").datum(data).attr("d", area);
			});
		}, 10000);
	}, "json");
}

angular.module('app', []).controller('weather', [ '$scope', function($scope) {
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
	// Update every 60 seconds.
	setInterval(update, 60000);
	update();
} ]).controller('departures', [ '$scope', function($scope) {
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
} ]).controller('temperatures', [ '$scope', function($scope) {
	$scope.temperature = "-";
	function update() {
		$.get("/temperatures", function(j) {
			if (j.length > 0) {
				// Round temperature to one significant digit.
				$scope.temperature = Math.round(j[0].celsius * 10.0) / 10.0;
			} else {
				$scope.temperature = "-";
			}
			$scope.$apply();
		});
	}
	// Update every 10 seconds.
	setInterval(update, 10000);
	update();
} ]).controller('menu', [ '$scope', function($scope) {
	function update() {
		$.get("/menu", function(j) {
			$scope.dishes = j.map(function(d) {
				d.dish = trim(d.dish, 28);
				return d;
			}).slice(0, 4);
		});
		$scope.$apply();
	}
	// Update every 60 seconds.
	setInterval(update, 60000);
	update();
} ]);
