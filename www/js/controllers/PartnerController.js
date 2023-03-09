/*jslint browser: true*/
/*global console, MyApp*/

MyApp.angular.controller('PartnerController', ['$scope', '$rootScope', 'InitService', function ($scope, $rootScope, InitService) {
    
	'use strict';
	
	var self = this;
	var rootEvents = [];
	
    $scope.name = "";
    $scope.siren = "";
    $scope.address = "";
    $scope.showsubmit = false;
    $scope.clientstatus = "client";

	$scope.init = function() {
        supe.from('users')
        .select("*")
        .eq('id', global.user.id)
        .then((response) => {
            if (response.hasOwnProperty("error") && (response.error != null) && response.error.hasOwnProperty("message")) {
                console.warn("error : " + response.error.message);
                return;
            }
            let status = response.data[0].status;
            $scope.clientstatus = status;
            switch (status) {
                case "client":
                    // Show button submit
                    $scope.showsubmit = true;
                    break;
                case "parter_to_be":
                    // Hide button submit, show a message
                    $scope.showsubmit = false;
                    $$(".page.partner .page-content").css("background-color", "#F2F2F2");
                    break;
                case "parter":
                    // Hide form, Display a message
                    $scope.showsubmit = false;
                    $$(".page.partner .page-content").css("background-color", "#F2F2F2");
                    break;
            }
            self.sync();
        }).catch((error) => {
            console.warn(error);
        });
    };

    $scope.becomepartner = function() {
        let name = $scope.name;
        let siren = $scope.siren;
        let address = $scope.address;
        
        supe.from('Opticien').insert([
            { "name": name, "adresse": address, "siren": siren }
        ])
        .then((response) => {
            console.log(response);
            if (response.hasOwnProperty("error") && (response.error != null) && response.error.hasOwnProperty("message")) {
                console.warn("error : " + response.error.message);
                return;
            }
            self.UpdateProfile();
        }).catch((error) => {
            console.warn(error);
        });
    };

    self.UpdateProfile = function() {
        let data = { status: "parter_to_be" };
        supe.from('users')
        .update(data)
        .eq('id', global.user.id)
        .then((response) => {
            self.toast('Nous avons bien reçu votre demande');

        }).catch((error) => {
            console.warn(error);
        });
    };

    self.toast = function(msg) {
        let toastBottom = MyApp.fw7.app.toast.create({
            text: msg,
            closeTimeout: 2000,
        });
        toastBottom.open();
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