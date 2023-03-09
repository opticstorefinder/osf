/*jslint browser: true*/
/*global console, MyApp*/

MyApp.angular.controller('RendezvousController', ['$scope', '$rootScope', 'InitService', function ($scope, $rootScope, InitService) {
    
	'use strict';
	
	var self = this;
    self.lastorderid = -1;
	var rootEvents = [];
	// filter_motifs
    $scope.user = {};
    $scope.prestation = null;
    $scope.dateChoosed = false;
    $scope.prestations = [];
    $scope.serviceurl = "https://api.axelib.io/0.1/specific/osf/confirm.php";
    self.prestations = [{
        id: 1, type: "rdv", time: 90, class: "lunettes", filter: false,
        name: "Vérification de la vue + lunettes"
    }, {
        id: 2, type: "rdv", time: 60, class: "lunettes", filter: false,
        name: "Lunettes"
    }, {
        id: 3, type: "rdv", time: 60, class: "alentilles", filter: false,
        name: "Adaptation lentilles"
    }, {
        id: 4, type: "rdv", time: 30, class: "lentilles", filter: false,
        name: "Lentilles"
    }, {
        id: 5, type: "rdv", time: 30, class: "reparations", filter: true,
        name: "Réparations"
    }, {
        id: 6, type: "rdv", time: 15, class: "ajustage", filter: true,
        name: "Ajustages"
    }/*, {
        id: 7, type: "ccl", time: 15, class: "clickcollect", filter: false,
        name: "Click & Collect",
        subtext: "Lentilles et produits"
    }*/];

    InitService.addEventListener('ready', function () {
        log('RendezvousController: ok, DOM ready'); // DOM ready
    });
	
	$scope.init = function() {
        $scope.state = "motif";
        $scope.prestations = angular.copy(self.prestations);
        self.calendar = MyApp.fw7.app.calendar.create({
            inputEl: '#calendar-input'
        });
        $scope.opticien = localStorage.getItem("opticien");
        $scope.opticien = JSON.parse($scope.opticien);
        if (global.filter_motifs) {
            global.filter_motifs = false;
            $scope.prestations = [];
            for (let i = 0; i < self.prestations.length; i++) {
                if (self.prestations[i].filter == true)
                    $scope.prestations.push(self.prestations[i]);
            }
        }
        self.getcalendar();
        self.getLastRdv();
        self.sync();
	};

    self.getcalendar = function(callback) {
        $scope.calendaritems = [];
        self.sync();
        supe.from("opt_calendar").
        select("id, date, opticien, opt_creneau(id, heure_debut, heure_fin, operator)").
        eq('opticien', $scope.opticien.id).
        then(function(e) {
            console.log(e);
            $scope.calendaritems = e.data;
            self.sync();
            if (callback) callback();
        }).
        catch(function(e) {
            console.warn(e);
        });
    };

    $scope.switchState = function(presta) {
        if (presta == 'recap') $scope.state = "recap";
        else if (presta.type == "rdv") {
            $scope.state = "cdate";
            $scope.prestation = presta ? presta : $scope.prestation;
            $scope.calendaritems = GetSlots($scope.calendaritems, $scope.prestation.time);
        }
        else if (presta.type == "ccl") {
            mainView.router.navigate("/clickncollect/");
        }//$scope.state = "cdate";
        self.sync();
    };

    $scope.getDate = function(date, type) {
        return GetDateitem(new Date(date), type)
    };

    $scope.ShowSlots = function(item) {
        $scope.dateChoosed = false;
        for(let i = 0; i < $scope.calendaritems.length; i++) {
            if ($scope.calendaritems[i].id == item.id) {
                if (!item.showslots) item.showslots = true;
                else item.showslots = false;
            }
            else $scope.calendaritems[i].showslots = false;
        }
        self.sync();
    };

    self.bookslot = function(prestation, slot, callback) {
        // Split créneau bu removing the booked slot
        let timeSlot = angular.copy(slot.parent);
        let requestedSlot = angular.copy(slot);
        delete requestedSlot.parent;
        //debugger;
        //      (step, step_description, timeSlot, callback, slot1, slot2, slot3)
        //check is requested slot is in the timezone
        if ((timeSlot.start <= requestedSlot.start) && 
            (timeSlot.end >= requestedSlot.end)) {
            // 1. Le créneau est au début de la plage horaire
            if (timeSlot.start.getTime() === requestedSlot.start.getTime()) {
                if (timeSlot.end.getTime() === requestedSlot.end.getTime()) {
                    //debugger;
                    if (requestedSlot.op == 1) {
                        // Slot is to be removed
                        self.DivideSlots(1, "delete_slot", timeSlot, callback);
                    }
                    else {
                        timeSlot.op = requestedSlot.op;
                        self.DivideSlots(5, "decrement_employees", timeSlot, callback);
                    }
                }
                else {
                    //debugger;
                    let new_start_date = addMinutes(timeSlot.start, prestation.time);
                    let slot1 = {
                        start: timeSlot.start,
                        end: new_start_date,
                        start_view: self.getViewDate(timeSlot.start),
                        end_view: self.getViewDate(new_start_date),
                        op: (timeSlot.op - 1),
                        decrement: true
                    };
                    timeSlot.start = new_start_date;
                    timeSlot.start_view = self.getViewDate(new_start_date);
                    if (requestedSlot.op == 1) {
                        // Update the slot by removing the begining
                        self.DivideSlots(2, "change_slot_start", timeSlot, callback);
                    }
                    else {
                        // TODO !!!
                        timeSlot.op = requestedSlot.op;
                        self.DivideSlots(6, "2slots_first_decredement", timeSlot, callback, slot1);
                    }
                }
            }
            // 2. Le créneau se termine sur le fin de la plage horaire
            else if (timeSlot.end.getTime() === requestedSlot.end.getTime()) {
                debugger;
                let slot1 = {
                    start: requestedSlot.start,
                    end: timeSlot.end,
                    start_view: self.getViewDate(requestedSlot.start),
                    end_view: self.getViewDate(timeSlot.end),
                    op: (timeSlot.op - 1),
                    decrement: true
                };
                timeSlot.end = requestedSlot.start;
                timeSlot.end_view = self.getViewDate(timeSlot.end);
                if (requestedSlot.op == 1) {
                    // Update start of the time slot
                    self.DivideSlots(3, "change_slot_end", timeSlot, callback);
                }
                else {
                    // TODO !!!
                    timeSlot.op = requestedSlot.op;
                    self.DivideSlots(7, "2slots_last_decredement", timeSlot, callback, slot1);
                }
            }
            // 3. Le créneau est au milieu de la plage horaire
            else {
                // Split the slot
                let slot1 = {
                    start: timeSlot.start,
                    end: requestedSlot.start,
                    start_view: self.getViewDate(timeSlot.start),
                    end_view: self.getViewDate(requestedSlot.start),
                    op: (timeSlot.op - 1)
                };
                let slot2 = {
                    start: requestedSlot.end,
                    end: timeSlot.end,
                    start_view: self.getViewDate(requestedSlot.end),
                    end_view: self.getViewDate(timeSlot.end),
                    op: (timeSlot.op - 1)
                };
                let slot3 = {
                    start: requestedSlot.start,
                    end: requestedSlot.end,
                    start_view: self.getViewDate(requestedSlot.start),
                    end_view: self.getViewDate(requestedSlot.end),
                    op: (timeSlot.op - 1),
                    decrement: true
                };
                debugger;
                if (requestedSlot.op == 1)
                    self.DivideSlots(4, "make_two_slots", timeSlot, callback, slot1, slot2);
                else {
                    timeSlot.op = requestedSlot.op;
                    self.DivideSlots(8, "make_three_slots", timeSlot, callback, slot1, slot2, slot3);
                }
            }
        }
        else alert("There is an error with SLOTS !!! Contact Gilles !!!");
    };

    $scope.ChooseSlot = function(cdi, slot) {
        $$(".reeval").removeClass("hidden");
        let cid = angular.copy(self.lastorderid);
        self.getLastRdv(cid, function(result) {
            $$(".reeval").addClass("hidden");
            if (result) {
                for(let i = 0; i < cdi.slots.length; i++) {
                    if (cdi.slots[i].id == slot.id) {
                        slot.active = true;
                        $scope.slot = slot;
                        $scope.dateChoosed = true;
                        setTimeout(function() {
                            $scope.switchState('recap');
                        }, 150);
                    }
                    else cdi.slots[i].active = false;
                }
            }
            else {
                self.getcalendar(function() {
                    $scope.calendaritems = GetSlots($scope.calendaritems, $scope.prestation.time);
                    self.sync();
                });
            }
            self.sync();
        });
    };

    self.getViewDate = function(date) {
        let hours = (date.getHours() < 10) ? ("0" + date.getHours()) : date.getHours();
        let minutes = (date.getMinutes() < 10) ? ("0" + date.getMinutes()) : date.getMinutes();
        return hours + ":" + minutes;
    };

    $scope.confirm = function() {
        console.log($scope.prestation);
        console.log($scope.opticien);
        console.log(global.user);

        let url = $scope.serviceurl + "?page=1&count=100&fav=true&user=";
        let data = {
            "user": global.user.id,
            "opticien": $scope.opticien.id,
            "prestation": $scope.prestation.id,
            "date": ((new Date($scope.slot.start)).toISOString()).toLocaleString('fr-FR'),
            "time": $scope.slot.view + ':00',
            "motif": $scope.prestation.name,
            "informations": "otherValue information"
        };

        /*$f7.request.post(url, data).then((response) => {
            if (response.error != null) { console.warn(response.error.messages); return; }
            response.data = JSON.parse(response.data);
            console.log(response.data);
        })
        .catch((err) => {
            console.warn(err)
        });

        //return;*/
        
        self.bookslot($scope.prestation, $scope.slot, function() {
            debugger;
            supe.from('Rendezvous').insert([{ 
                date: ((new Date($scope.slot.start)).toISOString()).toLocaleString('fr-FR'), 
                time: $scope.slot.view + ':00', 
                opticien: $scope.opticien.id, 
                utilisateur: global.user.id, 
                motif: $scope.prestation.name, 
                informations: 'otherValue information'
            }])
            .then(function(e) {
                console.log(e);
                MyApp.fw7.app.dialog.alert('Votre rendez-vous a été créé !', "Merci", function() {
                    mainView.router.navigate("/");
                });
            })
            .catch(function(e) {
                console.warn(e);
            })
        });
        
    };

    self.DivideSlots = function(step, step_description, timeSlot, callback, slot1, slot2, slot3) {
        //callback();
        //return;
        switch(step) {
            case 1: console.log(step_description); // Detele slot
                supe.from('opt_creneau').delete().eq('id', timeSlot.id).then(function(e) {
                    //debugger;
                    if (typeof callback === 'function') callback();
                }).catch(function(e) { console.warn(e) });
                break;
            case 2: console.log(step_description);
                supe.from('opt_creneau').update({ "heure_debut": timeSlot.start_view }).eq('id', timeSlot.id).then(function(e) {
                    //debugger;
                    if (typeof callback === 'function') callback();
                }).catch(function(e) { console.warn(e) });
                break;
            case 3: console.log(step_description);
                supe.from('opt_creneau').update({ "heure_fin": timeSlot.end_view }).eq('id', timeSlot.id).then(function(e) {
                    //debugger;
                    if (typeof callback === 'function') callback();
                }).catch(function(e) { console.warn(e) });
                break;
            case 4: console.log(step_description);
                supe.from('opt_creneau').delete().eq('id', timeSlot.id).then(function(e) {
                    supe.from('opt_creneau').insert([
                        { "date": timeSlot.date_id, "heure_debut": slot1.start_view, "heure_fin": slot1.end_view },
                        { "date": timeSlot.date_id, "heure_debut": slot2.start_view, "heure_fin": slot2.end_view }
                    ]).then(function(e) {
                        //debugger;
                        if (typeof callback === 'function') callback();
                    }).catch(function(e) { console.warn(e) });
                }).catch(function(e) { console.warn(e) });
                break;
            case 5: console.log(step_description);
                // UPDATE OP IN SLOTS
                supe.from('opt_creneau').update({ "operator": (timeSlot.op - 1) }).eq('id', timeSlot.id).then(function(e) {
                    debugger;
                    if (typeof callback === 'function') callback();
                }).catch(function(e) { console.warn(e) });
                break;
            case 6: console.log(step_description);
                // UPDATE A SLOT (DECREMENT)
                // CREATE A NEW ONE
                supe.from('opt_creneau').update({ "heure_debut": timeSlot.start_view }).eq('id', timeSlot.id).then(function(e) {
                    //debugger;
                    //if (typeof callback === 'function') callback();
                    supe.from('opt_creneau').insert([
                        { "date": timeSlot.date_id, "heure_debut": slot1.start_view, "heure_fin": slot1.end_view, "operator": slot1.op }
                    ]).then(function(e) {
                        //debugger;
                        if (typeof callback === 'function') callback();
                    }).catch(function(e) { console.warn(e) });
                }).catch(function(e) { console.warn(e) });
                debugger;
                break;
            case 7: console.log(step_description);
                // UPDATE A SLOT (DECREMENT)
                // CREATE A NEW ONE
                supe.from('opt_creneau').update({ "heure_fin": timeSlot.end_view }).eq('id', timeSlot.id).then(function(e) {
                    //debugger;
                    //if (typeof callback === 'function') callback();
                    supe.from('opt_creneau').insert([
                        { "date": timeSlot.date_id, "heure_debut": slot1.start_view, "heure_fin": slot1.end_view, "operator": slot1.op }
                    ]).then(function(e) {
                        //debugger;
                        if (typeof callback === 'function') callback();
                    }).catch(function(e) { console.warn(e) });
                }).catch(function(e) { console.warn(e) });
                debugger;
                break;
            case 8: console.log(step_description);
                // DELETE SLOT
                // CREATE THREE SLOTS
                supe.from('opt_creneau').delete().eq('id', timeSlot.id).then(function(e) {
                    supe.from('opt_creneau').insert([
                        { "date": timeSlot.date_id, "heure_debut": slot1.start_view, "heure_fin": slot1.end_view, "operator": slot1.op },
                        { "date": timeSlot.date_id, "heure_debut": slot2.start_view, "heure_fin": slot2.end_view, "operator": slot2.op },
                        { "date": timeSlot.date_id, "heure_debut": slot3.start_view, "heure_fin": slot3.end_view, "operator": slot3.op }
                    ]).then(function(e) {
                        //debugger;
                        if (typeof callback === 'function') callback();
                    }).catch(function(e) { console.warn(e) });
                }).catch(function(e) { console.warn(e) });
                debugger;
                break;
        }
    };

    self.ReEstimateSlots = function() {
        
        /****/
        $scope.state = "cdate";
        //$scope.prestations = angular.copy(self.prestations);
        //self.calendar = MyApp.fw7.app.calendar.create({
        //    inputEl: '#calendar-input'
        //});
        //$scope.opticien = localStorage.getItem("opticien");
        //$scope.opticien = JSON.parse($scope.opticien);
        /*if (global.filter_motifs) {
            global.filter_motifs = false;
            $scope.prestations = [];
            for (let i = 0; i < self.prestations.length; i++) {
                if (self.prestations[i].filter == true)
                    $scope.prestations.push(self.prestations[i]);
            }
        }*/
        self.getcalendar();
        self.sync();
    };

    self.getLastRdv = function(origin, callback) {
        supe.from("Rendezvous")
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .then(function(e) {
            if (!e.error) {
                self.lastorderid = e.data[0].id;
                console.log("Last order id is : " + self.lastorderid);
                $$(".reeval").addClass("hidden");
                //debugger;
                if (origin && callback) {
                    if (origin == self.lastorderid) {
                        callback(true);
                    }
                    else {
                        callback(false);
                        let toastBottom = MyApp.fw7.app.toast.create({
                            text: 'Une autre commande a été passée, nous mettons à jour les horaires !',
                            position: 'top',
                            closeTimeout: 2000,
                        });
                        toastBottom.open();
                    }
                }
            }
        })
        .catch(function(e) {
            $$(".reeval").addClass("hidden");
            console.warn(e);
        })

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