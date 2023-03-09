/*jslint browser: true*/
/*global console, MyApp*/

MyApp.angular.controller('EngagementController', ['$scope', '$rootScope', 'InitService', function ($scope, $rootScope, InitService) {
    
	'use strict';
	
    $scope.SetArticle = function(id) {
        global.article_id = id;
    };

}]);