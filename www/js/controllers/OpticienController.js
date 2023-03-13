/*jslint browser: true*/
/*global console, MyApp*/

MyApp.angular.controller('OpticienController', ['$scope', '$rootScope', 'InitService', function ($scope, $rootScope, InitService) {
    
	'use strict';
	
	var self = this;
	var rootEvents = [];
    $scope.optic = {};
    $scope.matieres = [{
        id: 0, name: "Titane", class: "cr_tita", marques: "Ray-Ban, Gucci, Prada, Izipizi ...", active: false,
        description: "Resistantes et ultra légères, les montures en titane sont élégantes et ne vous laisseront pas de marque sur le nez."
    }, {
        id: 1, name: "Acetate", class: "cr_acet", marques: "Ray-Ban, Gucci, Prada, Izipizi ...", active: false,
        description: "Resistantes et ultra légères, les montures en acetate sont élégantes et ne vous laisseront pas de marque sur le nez."
    }, {
        id: 2, name: "Plastique", class: "cr_plas", marques: "Ray-Ban, Gucci, Prada, Izipizi ...", active: false,
        description: "Souples et ultra légères, les montures en plastique sont élégantes et ne vous laisseront pas de marque sur le nez."
    }, {
        id: 3, name: "Métallique", class: "cr_meta", marques: "Ray-Ban, Gucci, Prada, Izipizi ...", active: false,
        description: "Resistantes et ultra légères, les montures métallique sont élégantes et ne vous laisseront pas de marque sur le nez."
    }, {
        id: 4, name: "Bois", class: "cr_bois", marques: "Ray-Ban, Gucci, Prada, Izipizi ...", active: false,
        description: "Resistantes et ultra légères, les montures en bois sont élégantes et ne vous laisseront pas de marque sur le nez."
    }, {
        id: 5, name: "Carbone", class: "cr_carb", marques: "Ray-Ban, Gucci, Prada, Izipizi ...", active: false,
        description: "Resistantes et ultra légères, les montures en carbone sont élégantes et ne vous laisseront pas de marque sur le nez."
    }, {
        id: 6, name: "Corne", class: "cr_corn", marques: "Ray-Ban, Gucci, Prada, Izipizi ...", active: false,
        description: "Resistantes et ultra légères, les montures en corne sont élégantes et ne vous laisseront pas de marque sur le nez."
    }, {
        id: 7, name: "Recyclé", class: "cr_recy", marques: "Ray-Ban, Gucci, Prada, Izipizi ...", active: false,
        description: "Resistantes et ultra légères, les montures recyclés sont élégantes et ne vous laisseront pas de marque sur le nez."
    }];
	
	$scope.init = function() {
        $scope.id_matiere = -1;
        $scope.optic.distance = global.optic_distance;
        global.rdv_id = null;
        $scope.opticien_garanties_sav = getKey(global.sentences, "opticien_garanties_sav");
        self.sync();
        MyApp.fw7.app.on("opticien", function(e) {
            $scope.optic = e;
            $scope.optic.distance = global.optic_distance;
            localStorage.setItem("opticien", JSON.stringify(e));
            self.sync();
            BuildPhotoBrowser([$scope.optic.image]);
            /*myPhotoBrowserStandalone = $f7.photoBrowser.create({
                photos: [ 
                    $scope.optic.image
                ]
            });*/
        });
	};

    $scope.OpenPhotoBrowser = function() {
        myPhotoBrowserStandalone.open();
    };

    $scope.changematiere = function(n) {
        $scope.id_matiere = n;
        console.log("ok");
        for (let i = 0; i < $scope.matieres.length; i++) {
            if ($scope.matieres[i].id == n) {
                $scope.matieres[i].active = true;
            }
            else {
                $scope.matieres[i].active = false;
            }
        }
        self.sync();
    };

    $scope.SetOpticien = function() {
        localStorage.setItem("opticien", JSON.stringify($scope.optic));
        if (global.user && global.user.id)
            mainView.router.navigate("/rdv/");
        else
            MyApp.fw7.app.dialog.alert('Veuillez vous connecter pour prendre rendez-vous');
    };

    $scope.GoAfterSale = function() {

        mainView.router.navigate("/aftersale/");

        /*mainView.router.navigate("/", { "animate": false });
        setTimeout(function() {
            $$("#tab-rdv-link").click();
            MyApp.fw7.app.emit('rdv_past', {});
        }, 500);
        /*
        $scope.setTab('rdv');
        $scope.rdv_tab = 'past';
        self.sync();
        setTimeout(function() {
            let rdvs = []; 
            let now = new Date();
            let existPastRdv = false;
            for (let i = 0; i < $scope.rdvs.length; i++) {
                if (now > $scope.rdvs[i].rdvdate) {
                    existPastRdv = true; break;
                }
            }
            if (!existPastRdv) self.toast("Vous n'avez pas encore de rendez-vous terminés !");
        }, 1000);*/
    };

    $scope.OpenExternalLink = function() {
        let url = $scope.optic.website;
        if (!url.startsWith("http"))
            url = "http://" + url;
        OpenLink(url);
    };

    $scope.SetArticle = function(id) {
        global.article_id = id;
    };

    $scope.Share = function() {
        let url = "https://apps.axelib.io/custom/opticstorefinder/opticien.php?id=" + $scope.optic.id;
        if (window.hasOwnProperty("plugins")) {
            if (window.plugins.hasOwnProperty("socialsharing")) {
                window.plugins.socialsharing.share($scope.optic.name, "Optic Store Finder : Opticien", $scope.optic.image, url);
            }
            else {
                alert("window.plugins has no socialsharing property");
            }
        }
        else {
            alert("window has no plugins property");
        }
    };

    $scope.setPayM = function(e) {
        $scope.iActive = e;
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