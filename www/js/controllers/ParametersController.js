/*jslint browser: true*/
/*global console, MyApp*/

MyApp.angular.controller('ParametersController', ['$scope', '$rootScope', 'InitService', function ($scope, $rootScope, InitService) {
    
	'use strict';
	
	var self = this;
	$scope.pref = {};
	
	$scope.init = function() {
        self.asked = false;
        MyApp.fw7.app.on("parameter", function(e) {
            $$("#block-" + e).show();
        });
        if (!global.hasOwnProperty("user") || (global.user == null)) {
            $$(".toggle").addClass("disabled");
            $scope.pref = { "p_push_notifications": true }
            return;
        }
        let OnceGotParams = function(params) {
            $scope.pref = params;
            $scope.pref.no_p_profile_visibility_fav = !angular.copy($scope.pref.p_profile_visibility_fav);
            $scope.pref.no_p_profile_data_fav = !angular.copy($scope.pref.p_profile_data_fav);
            self.sync();
            global.user_params_before = angular.copy(params);
        };
        if (window.hasOwnProperty("user_params")) {
            OnceGotParams(global.user_params);
        }
        else {
            getUserData(OnceGotParams);
        }
	};

    $scope.request = function() {
        if (self.asked) {
            MyApp.fw7.app.dialog.alert("Votre demande a bien été enregistrée. Nous reviendrons vers vous dans les 48 heures");
            return;
        }
        MyApp.fw7.app.preloader.show();
        self.request(function() {
            MyApp.fw7.app.preloader.hide();
            MyApp.fw7.app.dialog.confirm('Vous recevrez un rapport contenant vos données par email dans les 48 heures', function () {
                console.log("ok");
                self.asked = true;
            });
        });
    };

    self.request = function(callback) {
        supe.from('z_data_request').insert([{ user_id : global.user.id }]).then(function(response) {
            MyApp.fw7.app.preloader.hide();
            if (response.error) {
                alert("Nous sommes désolés, une erreur s'est produite ! Veuillez re-essayer");
            }
            else callback();
        }).catch(function(error) {
            MyApp.fw7.app.preloader.hide();
            console.log(error);
        });
    };

    $scope.isLoggedIn = function() {
        let loggedIn = false;
        if (global.user && global.user.id) loggedIn = true;
        return loggedIn;
    };

    $scope.reverseValue = function(name) {
        $scope.pref[name] = $scope.pref["no_" + name];
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