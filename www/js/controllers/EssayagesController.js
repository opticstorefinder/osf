/*jslint browser: true*/
/*global console, MyApp*/

MyApp.angular.controller('EssayagesController', ['$scope', '$rootScope', 'InitService', function ($scope, $rootScope, InitService) {
    
	'use strict';
	
	var self = this;
	var rootEvents = [];
	
    $scope.user = {};
    $scope.essayages = [];
    $scope.zoomed = false;

    InitService.addEventListener('ready', function () {
        log('OpticienController: ok, DOM ready'); // DOM ready
    });
	
	$scope.init = function() {
        $scope.user = global.user;
        $scope.zoomed = false;
        $scope.essayages_intro = getKey(global.sentences, "essayages_intro");
        self.sync();
        self.adjustboxes();
        self.getEssayages();
	};

    self.getEssayages = function() {
        supe.from('users_essayage')
        .select('*')
        .eq('user_id', global.user.id)
        .then((response) => {
            console.log(response);
            $scope.essayages = response.data;
            self.sync();
            self.adjustboxes();
        }).catch((error) => {
            console.warn(error);
        });
    };

    self.adjustboxes = function() {
        let size = $$(".page.essayage .essayage_list").css("width");
        size = parseInt(size);
        $$(".page.essayage .essayage_list li div").each(function(obj, i) {
            $$(obj).css("height", (size/3 - 10) + "px");
            $$(obj).css("line-height", (size/3 - 10) + "px");
        });
    };

    $scope.zoomin = function(ess) {
        $scope.zoomed = true;
        self.id = ess.id;
        self.sync();
        $$(".zoomed_in").css("background-image", "url(" + ess.image + ")");
    };

    $scope.DeleteEssayage = function() {
        supe.from('users_essayage').delete()
        .eq('id', self.id)
        .then((response) => {
            if (!response.error) {
                $scope.zoomed = false;
                self.sync();
                self.getEssayages();
            }
            else {
                console.warn(response);
            }
        }).catch((err) => {
            console.warn("error !");
        });
    };

    $scope.getfile = function() {
        var elem = document.getElementById("file");
        elem.addEventListener("change", self.onimage , false);
        elem.click();
    };

    self.onimage = function() {
        var elem = document.getElementById("file");
        var file = elem.files[0];
        let ext = file.name.split(".")[file.name.split(".").length - 1];
        let now = (new Date()).getTime();
        let filename = "essayage_" + global.user.id + "_" + now + "." + ext;
        supe.storage.from("essayages").upload(filename, file)
        .then((response) => {
            elem.removeEventListener("change", self.onimage , false);
            if (!response.error) {
                let url = supe.storageUrl + "/object/public/essayages/" + response.data.path;
                console.log(url);
                self.CreateEssayage(url);
            }
            else {
                console.warn(response);
            }
        }).catch((err) => {
            elem.removeEventListener("change", self.onimage , false);
            self.errorhappened();
        });
    };

    self.CreateEssayage = function(url) {
        supe.from('users_essayage').insert([
            { "user_id": global.user.id, "image": url }
        ])
        .then((response) => {
            console.log(response);
            if (!response.error) {
                self.getEssayages();
            }
            else {
                console.warn(response);
            }
        }).catch((error) => {
            console.warn(error);
        });
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