angular.module('app', []).controller('weather', ['$scope', function($scope) {
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
}]).controller('temperatures', ['$scope', function($scope) {
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
}]);
