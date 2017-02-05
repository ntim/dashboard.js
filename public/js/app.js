
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
		template: '<div></div>',
		link: function(scope, element, attrs) {
			var height = 116;
			var colors = ["#375a7f", "#217dbb", "#00bc8c", "#007053"];
			var offset = parseFloat(attrs.offset);
			var range = parseFloat(attrs.range);
			// Data URI.
			var get_uri = function() {
				var selection = $('#span-select .active input')[0];
				var start = parseInt(selection.getAttribute('period'));
				var step = start / 60;
				return "/query/" + attrs.table + "/" + attrs.field + "/" + start + "s/" + step + "s";
			}
			// Data incubator.
			var incubate = function(values) {
				return [{
					x: values.map(function(v) {
							return v.time;
						}), 
					y: values.map(function(v) {
							return v.value;
						}), 
					type: "scatter"
				}];
			}
			// Create chart.
			var init = function() {
				$.get(get_uri(), function(values) {
					var layout =  {
						autosize: true,
						paper_bgcolor: '#000000ff',
						height: 148,
						font: {
							family: '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
						},
						xaxis: {
							showline: true,
							ticks: 'inside',
							mirror: 'allticks',
							tickangle: 0,
						},
						yaxis: {
							title: attrs.name + ' / ' + attrs.unit,
							showline: true,
							ticks: 'inside',
							mirror: 'allticks',
							hoverformat: '.2f', 
						},
						margin: {l: 50, b: 50, r: 30, t: 30}
					};
					Plotly.newPlot(element[0], incubate(values), layout);
				});
			}
			// Update function.
			var update = function() {
				$.get(get_uri(), function(values) {
					Plotly.restyle(element[0], incubate(values), [0]);
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
		}
	};
}]);;
