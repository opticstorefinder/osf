/*jslint browser: true*/
/*global console, MyApp*/

MyApp.angular.controller('FavorisController', ['$scope', '$rootScope', 'InitService', function ($scope, $rootScope, InitService) {
    
	'use strict';
	
	var self = this;
	var rootEvents = [];
	
    $scope.optics = [];
    $scope.serviceurl = "https://api.axelib.io/0.1/specific/osf/opticiens.php";

    InitService.addEventListener('ready', function () {
        log('OpticienController: ok, DOM ready'); // DOM ready
    });
	
	$scope.init = function() {
        $scope.optics = [];
        if (global.position) $scope.position = global.position;
        self.sync();
        
        if (!global.user || !global.user.id) {
            MyApp.fw7.app.dialog.confirm('Veuillez vous connecter pour avoir accès à cette fonctionnalité', function () {
                GoToPage("user");
                mainView.router.back();
            }, function () {
                mainView.router.back();
            });
        }
        else {
        MyApp.fw7.app.dialog.preloader('');
            let url = $scope.serviceurl + "?page=1&count=100&fav=true&user=" + global.user.id;
            if (global.position != null) {
                url += "&latitude=" + global.position.latitude + "&longitude=" + global.position.longitude;
            }
            setTimeout(function() {
                MyApp.fw7.app.request.get(url).then((response) => {
                    if (response.error != null) console.warn(response.error.messages);
                    else {
                        MyApp.fw7.app.dialog.close();
                        response.data = JSON.parse(response.data);
                        console.log(response.data);
                        if (response.data.length <= 0) {
                            $scope.page--;
                            self.sync();
                            return;
                        }
                        $scope.optics = $scope.optics.concat(response.data);
                        self.sync();
                    }
                })
                .catch((err) => {
                    console.warn(err)
                });
            }, 500);
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