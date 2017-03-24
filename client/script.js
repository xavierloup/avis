/* global angular, nodered, express, openwhisk */
function drawChart(alerts){
  $('#graph').highcharts({
    title: {
      text: 'Alert Sentiment Analysis'
    },
    xAxis: {
       categories: alerts.map(function(t, i){return i})
    },
    series: [
     {
       data: alerts.map(function(t){return t.score})
     }
    ]
});
}

// create the module and name it alertApp
// also include ngRoute for all our routing needs
var alertApp = angular.module('alertApp', ['ngRoute']);

// configure our routes
alertApp.config(function($routeProvider) {
    $routeProvider

        // route for the home page
        .when('/', {
            templateUrl : 'pages/list.html',
            controller  : 'listController'
        })

        // route for the list page
        .when('/list', {
            templateUrl : 'pages/list.html',
            controller  : 'listController'
        })

        // route for the detail page
        .when('/detail/:id', {
            templateUrl : 'pages/detail.html',
            controller  : 'detailController'
        })

        // route for the report page
        .when('/report', {
            templateUrl : 'pages/report.html',
            controller  : 'reportController'
        })

        // route for the about page
        .when('/about', {
            templateUrl : 'pages/about.html',
            controller  : 'aboutController'
        });
});

// create the controller and inject Angular's $scope
alertApp.controller('listController', function($scope, $http, $interval) {
    $scope.getAlerts = function() {
        $http.get('/alerts').then(function(data) {
            console.log(data);
            $scope.alerts = data.data.payload;
            // $interval( function refresh(){
            //     $scope.getAlerts();
            // }, 10000);
        })
    }

    // Manage list sorting
    $scope.sortProperty = 'creation_date';
    $scope.reverse = true;
    $scope.sortBy = function(sortProperty) {
        $scope.reverse = ($scope.sortProperty === sortProperty) ? !$scope.reverse : false;
        $scope.sortProperty = sortProperty;
    };

    // Load alerts on load
    $scope.getAlerts();
});

alertApp.controller('detailController', function($scope, $http, $routeParams) {
    $scope.getAlert = function(id) {
        $http.get('/alert?id=' + id).then(function(data) {
          console.log(data);
          $scope.alert = data.data.payload;
        })
    }
    // Load alerts on load
    $scope.getAlert($routeParams.id);
});

alertApp.controller('reportController', function($scope, $http) {
    $scope.drawReport = function() {
        $http.get('/alerts').then(function(data) {
            console.log(data);
            drawChart(data.data.payload);
        })
    }
    $scope.drawReport();
});

alertApp.controller('aboutController', function($scope) {
});
