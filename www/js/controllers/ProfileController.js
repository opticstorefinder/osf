/*jslint browser: true*/
/*global console, MyApp*/

MyApp.angular.controller('ProfileController', ['$scope', '$rootScope', 'InitService', function ($scope, $rootScope, InitService) {
    
	'use strict';
	
	var self = this;
	var rootEvents = [];
	
    $scope.user = {};

    InitService.addEventListener('ready', function () {
        log('OpticienController: ok, DOM ready'); // DOM ready
    });
	
	$scope.init = function() {
        $scope.user = angular.copy(global.user);
        self.user = angular.copy(global.user);
        $scope.monprofil_intro = getKey(global.sentences, "monprofil_intro");
        self.sync();
        self.calendar = MyApp.fw7.app.calendar.create({
            inputEl: '#calendar-input'
        });
        self.setAutomComplete();
        setTimeout(() => {
            if (global.user.user_metadata.DateDeNaissance != null) {
                self.calendar.setValue([new Date(global.user.user_metadata.DateDeNaissance[0])]);
            }   
        }, 200);
	};

    $scope.UpdateProfile = function() {
        let data = {
            "full_name": $scope.user.user_metadata.full_name,
            "telephone": $scope.user.user_metadata.telephone,
            "DateDeNaissance": self.calendar.getValue(), //$scope.user.user_metadata.DateDeNaissance,
            "Region": $scope.user.user_metadata.Region,
            "Sexe": $scope.user.user_metadata.Sexe,
            "Ville": $scope.user.user_metadata.Ville
        };
        let birthdate = $$("#calendar-input").val();
        supe.auth.updateUser({
            "data": data
        }).then(function(response) {
            console.log(response);
            global.user = response.data.user;
            let session = localStorage.getItem("session");
            session = JSON.parse(session);
            session.user = response.data.user;
            localStorage.setItem("session", JSON.stringify(session));
            supe.from('users')
            .update(data)
            .eq('id', $scope.user.id)
            .then((response) => {
                MyApp.fw7.app.emit('ProfileUpdate', global.user);
                self.toast('Votre profil a été mis à jour');
            }).catch((error) => {
                console.warn(error);
            });
        }).catch((error) => {
            console.warn(error);
        });
    };


    $scope.tobbi = function() {
        let test = 0;
        debugger;
        console.log(test);
    };

    $scope.UpdatePassword = function() {
        MyApp.fw7.app.dialog.password('Saisissez votre nouveau mot de passe', function (password) {
            supe.auth.updateUser({
                "password": password
            }).then(function(response) {
                self.toast('Votre mot de passe a été mis à jour');
            }).catch((error) => {
                console.warn(error);
            });
        });
    };

    $scope.ForgotPassword = function() {
        supe.auth.api.resetPasswordForEmail(email).then(function(response) {
            self.toast('Vous recevrez un email pour réinitialiser votre mot de passe');
        }).catch((error) => {
            console.warn(error);
        });
    };

    self.setAutomComplete = function() {
        // Dropdown with placeholder
        //let cities = ["Apple", "Orange", "Lemon"];
        self.autocompleteDropdownPlaceholder = $f7.autocomplete.create({
            inputEl: "#autocomplete-dropdown-placeholder",
            openIn: "dropdown",
            dropdownPlaceholderText: 'Saisir la ville. ex: "Paris"',
            source: function (query, render) {
                var results = [];
                if (query.length === 0) {
                    render(results);
                    return;
                }
                // Find matched items
                for (var i = 0; i < cities.length; i++) {
                    if (cities[i].toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(cities[i]);
                }
                // Render items by passing array with result items
                render(results);
            },
        });

    };

    $scope.SetSexe = function(e) {
        let v = $scope.user.user_metadata.Sexe;
        console.log(e);
        if ((e == "-") && (self.user.user_metadata.Sexe != "-")) {
            $scope.user.user_metadata.Sexe = angular.copy(self.user.user_metadata.Sexe);
            self.sync();
        }
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