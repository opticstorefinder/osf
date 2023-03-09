/*jslint browser: true*/
/*global console, MyApp*/

MyApp.angular.controller('ContactController', ['$scope', '$rootScope', 'InitService', function ($scope, $rootScope, InitService) {
    
	'use strict';
	
	var self = this;
	var rootEvents = [];
	
    $scope.contact = {};

	$scope.init = function() {
        $scope.contact = {};
        $scope.contact_intro = getKey(global.sentences, "contact_intro");
        self.CheckForm();
        self.sync();
	};

	$scope.submit = function() {
        console.log($scope.contact);
        //debugger;
        MyApp.fw7.app.preloader.show();
        supe.from('Contact').insert([$scope.contact]).then(function(response) {
            MyApp.fw7.app.preloader.hide();
            if (response.error) {
                alert("Nous sommes désolés, une erreur s'est produite ! Veuillez re-essayer");
            }
            else {
                MyApp.fw7.app.dialog.alert("Votre message a été envoyé !", "Merci", function() {
                    global.messageSent = true;
                    self.CheckForm();
                });
            }
        }).catch(function(error) {
            MyApp.fw7.app.preloader.hide();
            console.log(error);
        });
	};

    self.CheckForm = function() {
        if (global.hasOwnProperty("messageSent") && (global.messageSent == true)) {
            $$("#my-contact-form").hide();
            $$("#my-contact-message").show();
        }
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