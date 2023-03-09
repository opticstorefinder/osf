/*jslint browser: true*/
/*global console, Framework7, MyApp, $document*/

MyApp.angular.factory('InitService', ['$document', function($document) {
    
	'use strict';

    var pub = {}, eventListeners = { 'ready': [] };
	
    pub.addEventListener = function(eventName, listener) {
        eventListeners[eventName].push(listener);
    };
	
    function onReady() {
        var fw7 = MyApp.fw7, i;
        //fw7.views.push(fw7.app.addView('.view-main', fw7.options));
        //MyApp.fw7.views.push(MyApp.fw7.app.addView('.view-main', fw7.options));

        /*var view = MyApp.fw7.app.views.create(".view-main"/*, {
            on: {
                pageInit: function () {
                    console.log("page init");
                },
            },
        });*/
		
		//MyApp.fw7.app.views.create(".view-main")
		
        for (i = 0; i < eventListeners.ready.length; i = i + 1) {
            eventListeners.ready[i]();
        }
    }
	
    // Init
    (function() {
        $document.ready(function() {
			//console.clear();
			//debugger;
			//CheckNetwork();
            if (document.URL.indexOf("http://") === -1 && document.URL.indexOf("https://") === -1) {
                // Cordova
				global.isDevice = true;
                //log("Using Cordova/PhoneGap setting");
                document.addEventListener("deviceready", onReady, false);
            } else {
                // Web browser
                //log("Using web browser setting");
                onReady();
				global.isDevice = false;
            }
        });
    }());
	
    return pub;

}]);

