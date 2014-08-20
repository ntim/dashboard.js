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
	setInterval(update, 10000);
	update();
}]).controller('departures', ['$scope', function($scope) {
	$scope.departures = [];
	function update() {
		$.get("/departures", function(j) {
			j = j.slice(0, 12);
			j = j.map(function(d) {
				if (d.eta < 60.0) {
					d.eta = "now";
				} else {
					d.eta = Math.round(d.eta / 60.0) + " m";
				}
				return d;
			});
			$scope.departures = j;
			$scope.$apply();
		});
	}
	setInterval(update, 10000);
	update();
}]).controller('temperatures', ['$scope', function($scope) {
	$scope.temperature = "-";
	function update() {
		$.get("/temperatures", function(j) {
			if (j.length > 0) {
				$scope.temperature = Math.round(j[0].celsius * 10.0) / 10.0;
			} else {
				$scope.temperature = "-";
			}
			$scope.$apply();
		});
	}
	setInterval(update, 10000);
	update();
}]);
