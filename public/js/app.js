function ColorCycler() {
	this.colors = ["#0275d8", "#5cb85c", "#d9534f"]
	this.idx = 0;

	this.next = function() {
		var c = this.colors[this.idx++];
		if (this.idx >= this.colors.length) {
			this.idx = 0;
		}
		return c;
	}
}
// Define globally to cycle plot line colors globally.
var cycler = new ColorCycler();

function DataIncubator() {
	this.data = {
		x: [], 
		y: [], 
		type: "scatter", 
		line: { 
			color: cycler.next() 
		}
	};
	this.update = function(values) {
		// Prepare values
		x = values.map(function(v) {
			return v.time;
		});
		y = values.map(function(v) {
			return v.value;
		});
        // Delete old data.
		while (this.data.x.length > 0) {
			this.data.x.pop();
			this.data.y.pop();
		}
		// Add new data.
		for (var i = 0; i < x.length; i++) {
			this.data.x.push(x[i]);
			this.data.y.push(y[i]);
		}
		return this.data;
	}
}

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
		restrict: 'E',
		replace: true,
		template: '<div class="chart"></div>',
		link: function(scope, element, attrs) {
			// Data URI.
			var get_uri = function() {
				var selection = $('#span-select .active input')[0];
				var start = parseInt(selection.getAttribute('period'));
				var step = start / 60;
				return "/query/" + attrs.table + "/" + attrs.field + "/" + start + "s/" + step + "s";
			}
			// Data incubator.
			var incubator = new DataIncubator();
			// Create chart.
			var init = function() {
				$.get(get_uri(), function(values) {
					var layout =  {
						autosize: true,
						paper_bgcolor: '#303030',
						plot_bgcolor: '#303030',
						height: 148,
						font: {
							family: '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
							color: 'white'
						},
						xaxis: {
							type: 'date',
							showline: true,
							ticks: 'inside',
							mirror: 'allticks',
							zeroline: false,
							tickangle: 0,
							linecolor: 'white',
						},
						yaxis: {
							showline: true,
							ticks: 'inside',
							zeroline: false,
							hoverformat: '.2f ', 
							anchor: 'free',
							position: 0.1,
							tickfont: {
								color: '#888888'
							}
						},
						margin: {l: 0, b: 40, r: 0, t: 0}
					};
					var options = {
						displayModeBar: false,
						scrollZoom: false
					}
					Plotly.newPlot(element[0], [incubator.update(values)], layout, options);
				});
			}
			// Update function.
			var update = function() {
				$.get(get_uri(), function(values) {
					incubator.update(values);
					Plotly.redraw(element[0]);
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
			// Listen to changes of the duration setting.
			$('#span-select label').click(function() {
				$('#span-select label').removeClass('active');
				$(this).addClass('active');
				update();
			});
			//
			angular.element($window).bind('resize', function() {
				Plotly.Plots.resize(element[0]);
			});
		}
	};
}]);;
