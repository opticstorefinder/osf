/*jslint browser: true*/
/*global console, MyApp*/

MyApp.angular.controller('EssayagesController', ['$scope', '$rootScope', 'InitService', function ($scope, $rootScope, InitService) {
    
	'use strict';
	
	var self = this;
	var rootEvents = [];
	
    $scope.user = {};
    $scope.essayages = [];
    $scope.zoomed = false;
    
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

    $scope.AddEssayage = function() {
        window.plugins = window.hasOwnProperty("plugins") ? window.plugins : {};
        if (!window.plugins.hasOwnProperty("actionsheet")) {
            self.getfile();
            return;
        }
        var options = {
            androidTheme: window.plugins.actionsheet.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT, // default is THEME_TRADITIONAL
            title: "Ajouter la photo de votre essayage ?",
            subtitle: "Choisir la source", // supported on iOS only
            buttonLabels: ["Galerie de photos", "Nouvelle photo"],
            androidEnableCancelButton: true, // default false
            winphoneEnableCancelButton: true, // default false
            addCancelButtonWithLabel: "Annuler",
            position: [20, 40], // for iPad pass in the [x, y] position of the popover
            destructiveButtonLast: true // you can choose where the destructive button is shown
        };
        // Depending on the buttonIndex, you can now call
        window.plugins.actionsheet.show(options, function(buttonIndex) {
            //alert("index : " + buttonIndex);
            switch(buttonIndex) {
                case 1: // Galerie de photos
                    self.getfile();
                    break;
                case 2: // Nouvelle Photo
                    self.takePicture();
                    break;
                case 3: // Annuler
                    break;
            }
        });
    };

    self.getfile = function() {
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
    
    self.takePicture = function() {
        navigator.camera.getPicture(self.onSuccess, self.onFail, { 
            quality: 100,
            allowEdit: false, 
            correctOrientation: true,
            sourceType: Camera.PictureSourceType.CAMERA,
            encodingType: Camera.EncodingType.JPEG,
            destinationType: Camera.DestinationType.DATA_URL,
            targetWidth: 500,
            targetHeight: 500
        });
    };
    
    self.onSuccess = function(imageData) {
        var image = new Image();
        image.src = 'data:image/png;base64,' + imageData; // jpg ?
        //$(".pic_area").css("background-image", "url('" + image.src + "')");
        document.getElementById('essayageImg').src = "data:image/jpeg;base64," + imageData;
        /*********************/
        supe.storage.from("essayages").upload("toto.png", imageData)
        .then((response) => {
            if (!response.error) {
                let url = supe.storageUrl + "/object/public/essayages/" + response.data.path;
                alert(url);
                //if (success) success(url);
            }
            else {
                alert(response);
                console.warn(response);
            }
        }).catch((err) => {
            alert(err);
            //elem.removeEventListener("change", self.onimage , false);
            //self.errorhappened();
        });
    };
    
    self.onFail = function(message) {
        alert('Failed because: ' + message);
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