/*jslint browser: true*/
/*global console, MyApp*/

MyApp.angular.controller('ClickncollectController', ['$scope', '$rootScope', 'InitService', function ($scope, $rootScope, InitService) {
    
	'use strict';
	
	var self = this;
	var rootEvents = [];
	
    $scope.user = {};

    InitService.addEventListener('ready', function () {
        log('ClickncollectController: ok, DOM ready'); // DOM ready
    });
	
	$scope.init = function() {
        $scope.user = global.user;
        self.sync();
	};

    self.sync = function () { 
        if (!$scope.$$phase) { 
            $scope.$digest();
            if (self.applying) return;
            self.applying = true;
            $scope.$apply(function() {
                self.applying = false;
            });
        } 
    };
	
}]);