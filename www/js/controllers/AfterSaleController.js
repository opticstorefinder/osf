/*jslint browser: true*/
/*global console, MyApp*/

MyApp.angular.controller('AfterSaleController', ['$scope', '$rootScope', 'InitService', function ($scope, $rootScope, InitService) {
    
	'use strict';
	
	var self = this;
	var rootEvents = [];

    $scope.rdv = {};
    $scope.recu = "";
    $scope.note = "";
    $scope.disabled = false;
    $scope.zonecasse = null;
    $scope.image_casse = "";
    $scope.zoneinconfort = "";
    $scope.cassedirecte = false;
    $scope.serviceurl = "https://api.axelib.io/0.1/specific/osf/computestars.php";
	
    InitService.addEventListener('ready', function () {
        log('AfterSaleController: ok, DOM ready'); // DOM ready
    });
	
	$scope.init = function() {
        $scope.recu = "";
        self.toastSuccess = MyApp.fw7.app.toast.create({
            text: "Informations transmises", position: 'center', closeTimeout: 2000,
        });
        $f7.on('zoneinconfort', function(e) {
            $scope.zoneinconfort = e;
            self.sync();
        });
        setTimeout(function() {
            if (global.hasOwnProperty("rdv_id") && global.rdv_id) {
                $scope.id = global.rdv_id;
                console.log("rdv : " + global.rdv_id);
                self.getRdv($scope.id);
            }
            else {
                $scope.cassedirecte = true;
                $scope.origin = "Casse";
                $scope.recu = "yes";
                $scope.note = 3;
                document.querySelectorAll(".cassedirecte").forEach(item => {
                    item.style.display = "none";
                    console.log("uba");
                });
            }
            self.sync();
        }, 150);
	};

    self.getRdv = function(id) {
        //godown
        if (!id) return;
        supe.from('Rendezvous')
        .select('id, date, time, utilisateur, note, opticien(id, name, image), motif, incident, informations')
        .eq('id', id)
        .then((response) => {
            if (!response.error) {
                $scope.rdv = response.data[0];
                self.sync();
            }
            else console.warn(response);
        }).catch((error) => {
            console.warn(error);
        });
    };

    $scope.ShowInconfort = function() {
        $$(".zinconfort").show();
    };
    
    $scope.HideInconfort = function() {
        $$(".zinconfort").hide();
    };

    $scope.ClickArea = function(area) {
        $scope.zoneinconfort = area;
        self.sync();
        $scope.HideInconfort();
    };

    $scope.NoteAfterSale = function(note) {
        $scope.note = note;
        self.sync();
    };

    self.CasseDirecte = function() {
        let data = {
            received: true, 
            note: 0, 
            callback: true, 
            utilisateur: global.user.id,
            opticien: null,
            status: "submitted",
            OriginProblem: "Casse", 
            motif: "Casse de lunettes (anciennes)",
            ZoneDetail: $scope.zonecasse, 
            imagecasse: $scope.image_casse, 
            incident: true, 
            date: ((new Date()).toISOString()).toLocaleString('fr-FR'),
	        time: ((new Date()).toISOString()).toLocaleString('fr-FR').substring(11, 16),
            remark: "Le client rencontre un problème de casse sur une ancienne paire de lunettes" 
        };
        let opticien = localStorage.getItem("opticien") ? JSON.parse(localStorage.getItem("opticien")) : null;
        if (!opticien.hasOwnProperty("id")) return;
        else data.opticien = opticien.id;
        console.log("casse directe !");
        supe.from('Rendezvous')
        .insert([data])
        .then(function(response) {
            if (!response.error) {
                $scope.disabled = true;
                self.sync();
                self.toastSuccess.open(); // Open it
                /*if (data.note) MyApp.fw7.app.emit("RdvTermine", $scope.id, data.note);
                if (n > 2) self.ComputeStars($scope.id);
                if (openRdv) {
                    global.filter_motifs = true;
                    localStorage.setItem("opticien", JSON.stringify($scope.rdv.opticien));
                    if (global.user && global.user.id) {
                        $scope.disabled = false;
                        self.sync();
                        mainView.router.navigate("/rdv/");
                    }
                }*/
            }
            else {
                console.warn(response);
            }
        }).catch((err) => {
            self.errorhappened();
        });
    };

    $scope.vote = function(n) {
        let data = {}, openRdv = false;
        if (!$scope.id || $scope.id == null) {
            self.CasseDirecte();
            return;
        }
        switch(n) {
            case 1: data = {received: false, callback: true, remark: "Le client n'a toujours pas reçu ses lunettes. Il souhaite être recontacté !" };
                break;
            case 2: data = {received: false, callback: false, remark: "Le client n'a toujours pas reçu ses lunettes. Ne souhaite pas être recontacté pour l'instant" };
                break;
            case 3: data = {received: false, note: $scope.note, callback: true, OriginProblem: $scope.origin, remark: "Le client a reçu ses lunettes. Il est satisfait !", comment: $scope.comment };
                break;
            case 4: data = {received: false, note: $scope.note, callback: true, OriginProblem: $scope.origin, remark: "Le client a reçu ses lunettes. Cependant il rencontre un problème d'esthétique" };
                openRdv = true;
                break;
            case 5: data = {received: false, note: $scope.note, callback: true, OriginProblem: $scope.origin, ZoneDetail: $scope.zoneinconfort, remark: "Le client a reçu ses lunettes. Cependant il rencontre un problème d'inconfort" };
                openRdv = true;
                break;
            case 6: data = {received: false, note: $scope.note, callback: true, OriginProblem: $scope.origin, ZoneDetail: $scope.zonecasse, imagecasse: $scope.image_casse, remark: "Le client a reçu ses lunettes. Cependant il rencontre un problème de casse" };
                break;
        }
        supe.from('Rendezvous')
        .update(data)
        .eq('id', $scope.id)
        .then(function(response) {
            if (!response.error) {
                $scope.disabled = true;
                self.sync();
                self.toastSuccess.open(); // Open it
                if (data.note) MyApp.fw7.app.emit("RdvTermine", $scope.id, data.note);
                if (n > 2) self.ComputeStars($scope.id);
                if (n == 3) {
                    debugger;
                    $f7.dialog.alert("Vous serez redirigés vers les pages d'associations", "Optic Store Finder", function() {
                        //GoToPage("user");
                        GoToPage("trends", 0)
                        mainView.router.back();
                    });
                }
                if (openRdv) {
                    global.filter_motifs = true;
                    localStorage.setItem("opticien", JSON.stringify($scope.rdv.opticien));
                    if (global.user && global.user.id) {
                        $scope.disabled = false;
                        self.sync();
                        mainView.router.navigate("/rdv/");
                    }
                }
            }
            else {
                console.warn(response);
            }
        }).catch((err) => {
            self.errorhappened();
        });
    };

    self.ComputeStars = function(rdvid) {
        let data = { id: $scope.rdv.opticien.id };
        $f7.request.post($scope.serviceurl, data).then((response) => {
            if (response.error != null) { console.warn(response.error.messages); return; }
            response.data = JSON.parse(response.data);
            console.log(response.data);
        })
        .catch((err) => {
            console.warn(err)
        });
    };
    
    $scope.getfile = function() {

        $f7.dialog.create({
            title: "Joindre une image",
            text: "Choisir la source de l'image",
            buttons: [
                { text: "Bibliothèque" },
                { text: "Appareil photo" }
            ],
            verticalButtons: true,
            onClick: function(dialog, index) {
                console.log("ok");
                if (index == 0) {
                    var elem = document.getElementById("file");
                    elem.addEventListener("change", self.onimage , false);
                    elem.click();
                }
                else {
                    //ToDo : take picture
                    navigator.camera.getPicture(self.onSuccess, self.onFail, { 
                        quality: 100,
                        allowEdit: false, 
                        correctOrientation: true,
                        sourceType: Camera.PictureSourceType.CAMERA,
                        encodingType: Camera.EncodingType.JPEG,
                        //destinationType: Camera.DestinationType.FILE_URI,
                        destinationType: Camera.DestinationType.DATA_URL,
                        targetWidth: 700,
                        targetHeight: 700
                    });
                }
            }
        }).open();

        //var elem = document.getElementById("file");
        //elem.addEventListener("change", self.onimage , false);
        //elem.click();
    };

    self.onSuccess = function(imageData) {
        let base64Obj = 'data:image/png;base64,' + imageData;
        //var image = new Image();
        //image.src = 'data:image/png;base64,' + imageData;
        //$(".pic_area").css("background-image", "url('" + image.src + "')");
        //document.getElementById('profileimg').src = "data:image/jpeg;base64," + imageData;
        //self.AfterImageReceived();
        /*urltoFile(image.src, 'image.png', 'image/png').then(function(file) {
            debugger;
            console.log(file);
            self.onimage(file);
        });*/
        fallingSky(base64Obj, "image.png", "image/png", function(file) {
            console.log(file);
            self.onimage(file);
        });
    };
    
    self.onFail = function(message) {
        alert('Failed because: ' + message);
    };

    self.onimage = function(rFile) {
        var elem = document.getElementById("file");
        var file = rFile ? rFile : elem.files[0];
        let ext = file.name.split(".")[file.name.split(".").length - 1];
        let now = (new Date()).getTime();
        let filename = "casse_" + global.user.id + "_" + now + "." + ext;
        supe.storage.from("casse").upload(filename, file)
        .then((response) => {
            elem.removeEventListener("change", self.onimage , false);
            if (!response.error) {
                let url = supe.storageUrl + "/object/public/casse/" + response.data.path;
                console.log(url);
                $scope.image_casse = url;
                self.sync();
            }
            else {
                console.warn(response);
            }
        }).catch((err) => {
            elem.removeEventListener("change", self.onimage , false);
            self.errorhappened();
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