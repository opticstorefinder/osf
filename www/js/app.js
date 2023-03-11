//const { $ } = require("dom7");

var $$ = Dom7;

var device = Framework7.getDevice();

var global = {
	user: null,
	position: null
};

global.category_name = '';
global.nblike = 0;
global.scroll = 0;
global.osfapi = "https://api.axelib.io/0.1/specific/osf";

// Theme
var theme = 'auto';
if (document.location.search.indexOf('theme=') >= 0) {
	theme = document.location.search.split('theme=')[1].split('&')[0];
}

// Init angular
var MyApp = {};
MyApp.config = {};

MyApp.angular = angular.module('MyApp', ["ngTouch", "ngSanitize"])
/*
This directive is used to open regular and dynamic href links inside of inappbrowser.
*/
.directive('hrefInappbrowser', function() {
	return {
		restrict: 'A',
		replace: false,
		transclude: false,
		link: function(scope, element, attrs) {
			var href = attrs['hrefInappbrowser'];
			attrs.$observe('hrefInappbrowser', function(val) {
				href = val;
			});
			element.bind('click', function (event) {
				window.open(href, '_system', 'location=yes');
				event.preventDefault();
				event.stopPropagation();
			});
		}
	};
});



MyApp.fw7 = {
	app : new Framework7({

    //var app = new Framework7({
        name: "Optic Store Finder", // App name
        theme: "md", // Automatic theme detection
        el: "#app", // App root element
        id: "io.framework7.myapp", // App bundle ID
        // App store
        store: store,
        // App routes
        routes: routes,
		// Dialogs
		dialog: {
			buttonOk: "OK",
			buttonCancel: "Annuler"
		},
		// Swipeout
		swipeout: {
			noFollow: true,
			removeElements: false
		},
        // Input settings
        input: {
            scrollIntoViewOnFocus: device.cordova && !device.electron,
            scrollIntoViewCentered: device.cordova && !device.electron,
        },
        // Cordova Statusbar settings
        statusbar: {
            iosOverlaysWebView: true,
            androidOverlaysWebView: false,
        },
        on: {
            init: function () {
                var f7 = this;
                if (f7.device.cordova) {
                    // Init cordova APIs (see cordova-app.js)
                    cordovaApp.init(f7);
                }
            },
        },
    }),
    views : []
};

var mainView = MyApp.fw7.app.views.create(".view-main");

var myEvents = new Framework7.Events();

$f7 = MyApp.fw7.app;

//document.addEventListener("deviceready", onDeviceReady, false);

if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
	document.addEventListener("deviceready", onDeviceReady, false);
} else {
	onDeviceReady();
}

function onDeviceReady() {
    // Now safe to use device APIs
	//alert("Device is ready !");
	setTimeout(ManageHistory, 1500);
	navigator.splashscreen.hide();
	SetNotification();
}

function SetNotification() {
	if (!window.hasOwnProperty("PushNotification")) return;
	const push = PushNotification.init({
		android: {
		},
		browser: {
			pushServiceURL: 'http://push.api.phonegap.com/v1/push'
		},
		ios: {
			alert: "true",
			badge: "true",
			sound: "true"
		},
		windows: {}
	});
	
	push.on('registration', (data) => {
		console.log('Reg id : ' + data.registrationId);
		supe.from('users')
		.update({ "push_reg_id": data.registrationId })
		.eq('id', global.user.id)
		.then((response) => {
			console.log("Registration ID updated !")
		}).catch((error) => {
			console.warn(error);
		});
	});
	
	push.on('notification', (data) => {
		// data.message,
		// data.title,
		// data.count,
		// data.sound,
		// data.image,
		// data.additionalData

		// With callback on close
		BuildNotif(data.title, data.message, data.additionalData, function(res) {
			MyApp.fw7.app.emit('NotifOpenPage', res.additional_info);
		});
	});
	
	push.on('error', (e) => {
		// e.message
	});
}

function BuildNotif(title, message, additionalData, callback) {
	let notificationFull = $f7.notification.create({
		icon: '<img src="assets/img/iconelight.jpg"></img>',
		title: "Optic Store Finder",
		titleRightText: "maintenant",
		subtitle: title,
		text: message,
		closeTimeout: 3000,
		on: {
			close: function () {
				let res = (typeof additionalData == "string") ? JSON.parse(additionalData) : additionalData;
				if (callback) callback(res);
			},
		}
	});
	notificationFull.open();
}

function ManageHistory() {
	if (mainView.router.history.length <= 0) {
		mainView.router.history.push("/");
	}
	else if (mainView.router.history.length == 1) {
		mainView.router.history = ["/"];
	}
	else {
		if (mainView.router.history[0] != "/") {
			debugger;
			numbers.splice(0, 0, "/");
		}
	}
}

// Login Screen Demo
$$("#my-login-screen .login-button").on("click", function () {
    var username = $$('#my-login-screen [name="username"]').val();
    var password = $$('#my-login-screen [name="password"]').val();

    // Close login screen
    MyApp.fw7.app.loginScreen.close("#my-login-screen");

    // Alert username and password
    MyApp.fw7.app.dialog.alert("Username: " + username + "<br/>Password: " + password);
});

var range = MyApp.fw7.app.range.create({
    el: ".range-slider",
    on: {
        change: function () {
            console.log("Range Slider value changed");
        },
    },
});





function log(msg) {
	if (window.console) {
		console.log(msg);
	}
}



global.favoris = [{
	name: "Le bêlleh",
	description: "12 plade de la république, 75012",
	image: "https://cdn.framework7.io/placeholder/fashion-88x88-1.jpg"
}, {
	name: "Don't Stop Me Now",
	description: "4 rue de cambrai, 75019",
	image: "https://cdn.framework7.io/placeholder/fashion-88x88-2.jpg"
}, {
	name: "Billie Jean",
	description: "Michael Jackson",
	image: "https://cdn.framework7.io/placeholder/fashion-88x88-3.jpg"
}];

global.notifications = [];
global.categories = [];
global.business = [];
global.lists = [];
global.selections = [];
global.articles = [];
global.news = [];
global.favorites = [];



function calculheight() {
	let imgHeight = $$(".image-eta2 img").css("height");
	let nvbrHeight = $$(".societe .navbar").css("height");
	let mgTop = parseFloat(imgHeight) - parseFloat(nvbrHeight) - 27;
	let cliqabl = parseFloat(imgHeight) - 52;
	$$(".block.art-content").css("margin-top", mgTop + "px");
	$(".imgCliqable").css("height", cliqabl + "px");
}




function resizemap(a) {
	if (a || (!window.global.hasOwnProperty("resized") && (window.global.resized == false))) {
		window.global.resized = true;
		window.global.map.resize();
	}
}




var cached = [
	{
		type: "html",
		path: "index.html"
	}, {
		type: "html",
		path: "pages/home.html"
	}, {
		type: "html",
		path: "pages/list.html"
	}, {
		type: "html",
		path: "pages/societe.html"
	}, {
		type: "html",
		path: "pages/categories.html"
	}, {
		type: "html",
		path: "pages/profile.html"
	}, {
		type: "html",
		path: "pages/login.html"
	}
];



window.onload = function() {
	/*setTimeout(function() {
		for(let i = 0; i < cached.length; i++) {
			let item = cached[i];
			switch(item.type) {
				case "html":
					// XHR to request a JS and a CSS
					var xhr = new XMLHttpRequest();
					xhr.open('GET', item.path);
					xhr.send('');
					break;
				case "img":
					// preload image
					new Image().src = item.path;
			}
		}
	}, 500);*/
};



/////



(function () {/*
	var host = 'wss://socket.axelib.io:9750';
	var socket = new WebSocket(host);
	socket.params = { it: null, online: false, lastping: null };
	socket.onopen = function(e) {
		console.log("socket opened !");
		socket.params.it = setInterval(function() {
			let now = new Date();
			var seconds = (now.getTime() - socket.params.lastping.getTime()) / 1000;
			if (seconds >= 30) {
				socket.close();
				console.log("Last ping was " + seconds + "sec ago !");
			}
		}, 30000);
	};
	socket.onmessage = function(e) {
		let msg = e.data;
		if (msg.startsWith("tick")) socket.params.lastping = new Date();
		else if(msg == "ping") setTimeout(function() { socket.params.lastping = new Date(); socket.send("pong"); }, 5000);
		else {
			console.log("Message received : " + msg);
		}
	};
	socket.onerror = function(e) {
		console.warn("error from websocket");
	};
	socket.onclose = function(e) {
		clearInterval(socket.params.it);
		console.log("WebSocket closed !");
	};*/
})();


var loadEssentials = {/*
	categories: new Promise((resolve, reject) => {
		supe.from('category')
			.select('*')
		.then((response) => {
			supabase_data_succeed(response, function() {
				global.categories = response.data;
				resolve(10);
			});
		}).catch(supabase_data_fail);
	}),
	news: new Promise((resolve, reject) => {
		supe.from('news')
			.select('*')
		.then((response) => {
			supabase_data_succeed(response, function() {
				global.news = response.data;
				resolve(10);
			});
		}).catch(supabase_data_fail);
	}),
	selections: new Promise((resolve, reject) => {
		supe.from('selection')
		.select(`id, created_at, name, image, description, short, author(first_name, last_name, profile)`)
		.then((response) => {
			supabase_data_succeed(response, function() {
				global.selections = response.data;
				resolve(10);
			});
		}).catch(supabase_data_fail);
	}),
	notifications: new Promise((resolve, reject) => {
		debugger;
		supe.from('notification')
		.select("*")
		.eq('id_user', supe.auth.currentUser.id)
		.then(function(response) {
			supabase_data_succeed(response, function() {
				global.notifications = response.data;
				resolve(10);
			});
		})
		.catch(supabase_data_fail)
	}),
	afrotimes: new Promise((resolve, reject) => {
		supe.from('afrotime')
		.select("*")
		.then(function(response) {
			supabase_data_succeed(response, function() {
				global.afrotimes = response.data;
				resolve(10);
			});
		})
		.catch(supabase_data_fail)
	})*/
};


loadEssentials = {
	categories: function() {
		return new Promise((resolve, reject) => {
			supe.from('category')
				.select('*')
			.then((response) => {
				supabase_data_succeed(response, function() {
					global.categories = response.data;
					resolve(10);
				});
			}).catch(supabase_data_fail);
		})
	},
	news: function() {
		return new Promise((resolve, reject) => {
			supe.from('news')
				.select('*')
				.eq("visible", true)
				.order('main', { ascending: false })
			.then((response) => {
				supabase_data_succeed(response, function() {
					global.news = response.data;
					resolve(10);
				});
			}).catch(supabase_data_fail);
		})
	},
	selections: function() {
		return new Promise((resolve, reject) => {
			supe.from('selection')
			.select(`id, created_at, name, image, description, short, visible, author(first_name, last_name, profile)`)
			.then((response) => {
				supabase_data_succeed(response, function() {
					global.selections = response.data;
					resolve(10);
				});
			}).catch(supabase_data_fail);
		})
	},
	notifications: function() {
		return new Promise((resolve, reject) => {
			supe.from('notification')
			.select("*")
			.eq('id_user', supe.auth.currentUser.id)
			.then(function(response) {
				supabase_data_succeed(response, function() {
					global.notifications = response.data;
					MyApp.fw7.app.emit('gotnotifications');
					resolve(10);
				});
			})
			.catch(supabase_data_fail)
		})
	},
	afrotimes: function() {
		return new Promise((resolve, reject) => {
			supe.from('afrotime')
			.select("*")
			.eq("visible", true)
			.then(function(response) {
				supabase_data_succeed(response, function() {
					global.afrotimes = response.data;
					resolve(10);
				});
			})
			.catch(supabase_data_fail)
		})
	},
	favorites: function() {
		return new Promise((resolve, reject) => {
			supe.from('favorites')
			.select('id, created_at, business(id, name, image), list(id, name)')
			.eq('id_user', supe.auth.currentUser.id)
			.then((response) => {
				//debugger;
				console.log(response);
				global.favorites = response.data;
				MyApp.fw7.app.emit('gotfavorites');
				resolve(10);
			})
			.catch(supabase_data_fail)
		})
	},
	lists: function() {
		//debugger;
		return new Promise((resolve, reject) => {
			supe.from('list')
			.select('*')
			.eq('owner', supe.auth.currentUser.id)
			.then((response) => {
				console.log(response);
				global.lists = response.data;
				MyApp.fw7.app.emit('gotfavorites');
				resolve(10);
			})
			.catch(supabase_data_fail)
		})
	},
	getnblike: function() {
		return new Promise((resolve, reject) => {
			supe.rpc('nblike', { "user_id": supe.auth.currentUser.id })
			.then((response) => {
				//console.log(response);
				//debugger;
				global.nblike = response.data[0].nb;
				MyApp.fw7.app.emit('gotlikes');
				resolve(10);
			})
			.catch(supabase_data_fail)
		})
	}
};

global.points = [];

function GetPageId() {
	let history = MyApp.fw7.app.views.main.history;
	let path = history[history.length-1];
	let id = path.substring(1, path.length - 1);
	id = id.substring(id.lastIndexOf("/") + 1);
	return id;
}


global.bounds = [
	[1.667780, 48.503906], // Southwest coordinates
	[2.919446, 49.171160]  // Northeast coordinates
];


function treatSupaFunction(item, index, arr) {
	Object.keys(item).forEach(key => {
		if (key.substring(0, 2) == "f_") {
			item[key.substring(2)] = item[key];
			delete item[key];
		}
	});
}



function intersectRect(r1, r2) {
    return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
}

function getVisibleMarkers() {
    var cc = global.map.getContainer();
    var els = cc.getElementsByClassName("mapboxgl-marker");
    var ccRect = cc.getBoundingClientRect();
    var visibles = [];
    for (var i = 0; i < els.length; i++) {
        var el = els.item(i);
        var elRect = el.getBoundingClientRect();
        intersectRect(ccRect, elRect) && visibles.push(el);
    }
    if (visibles.length > 0) console.log(visibles);
	return visibles;
}


function isInMyList(item) {
	if (item == 4) return true;
	return false;
}


function hide_preloader() {
	setTimeout(function() { MyApp.fw7.app.preloader.hide(); MyApp.fw7.app.dialog.close(); }, 350);
}

function supabase_data_fail(e) {
	hide_preloader();
	console.log("API Error !");
	console.warn(e);
}
function supabase_data_succeed(e, callback) {
	hide_preloader();
	console.log(e);
	if (!e.error) {
		callback();
	}
	else supabase_data_fail(e);
}



 
// JavaScript program to calculate Distance Between
// Two Points on Earth
function GetDistance(Point1, Point2)
{
	// Getting latitudes and longitudes
	let lat1 = Point1[0];
	let lat2 = Point2[0];
	let lon1 = Point1[1];
	let lon2 = Point2[1];

	// The math module contains a function
	// named toRadians which converts from
	// degrees to radians.
	lon1 =  lon1 * Math.PI / 180;
	lon2 = lon2 * Math.PI / 180;
	lat1 = lat1 * Math.PI / 180;
	lat2 = lat2 * Math.PI / 180;

	// Haversine formula 
	let dlon = lon2 - lon1; 
	let dlat = lat2 - lat1;
	let a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2),2);
	let c = 2 * Math.asin(Math.sqrt(a));

	// Radius of earth in kilometers. Use 3956 for miles
	let r = 6371;

	// calculate the result
	return(c * r);
}

// Driver code
//let lat1 = 53.32055555555556;
//let lat2 = 53.31861111111111;
//let lon1 = -1.7297222222222221;
//let lon2 = -1.6997222222222223;

//document.write(distance(lat1, lat2, lon1, lon2) + " K.M");

function LoginFromRegister() {
	mainView.router.back();
	setTimeout(function() {
		mainView.router.navigate('/login/');
	}, 320);
}
function RegisterFromLogin() {
	mainView.router.back();
	setTimeout(function() {
		mainView.router.navigate('/register/');
	}, 320);
}



function BuildFavLists (MyList) {
	//debugger;
	for(let i = 0; i < MyList.length; i++) {
		MyList[i].favorites = [];
		for (let j = 0; j < global.favorites.length; j++) {
			if (global.favorites[j].list.id == MyList[i].id) {
				MyList[i].favorites.push(global.favorites[j]);
			}
		}
	}
	return MyList;
}

function CheckFirstConnexion() {
	let metaData = supe.auth.currentUser.user_metadata;
	if (!metaData.hasOwnProperty("alreadysigned")) {
		supe.auth.update({
			data: { "alreadysigned": true } 
		}).then((response)=>{
			supabase_data_succeed(response, function() {
				supe.from("users").update({
					"first_name": metaData.first_name,
					"city": metaData.city
				})
				.eq('id', supe.auth.currentUser.id)
				.then((response)=>{
					supabase_data_succeed(response, function() {
						console.log(response);
					});
				}).catch(supabase_data_fail);
			});
		}).catch(supabase_data_fail);
	}
}


global.getMyPosition = function() {
	return [2.346394, 48.859117];
};


global.mapboxglAccessToken = 'pk.eyJ1IjoiZGFuc3dpY2siLCJhIjoiY2l1dTUzcmgxMDJ0djJ0b2VhY2sxNXBiMyJ9.25Qs4HNEkHubd4_Awbd8Og';


function PutMapInFrench(map) {
	//debugger;
	map.getStyle().layers.forEach(function(thisLayer) {
		if (thisLayer.id.indexOf('-label') > 0) {
			map.setLayoutProperty(thisLayer.id, 'text-field', ['get','name_fr']);
		}
	});
}

global.colors = [{ color: "red", hex: "#ff3b30" },
{ color: "green", hex: "#4cd964" },
{ color: "blue", hex: "#2196f3" },
{ color: "pink", hex: "#ff2d55" },
{ color: "yellow", hex: "#ffcc00" },
{ color: "orange", hex: "#ff9500" },
{ color: "purple", hex: "#9c27b0" },
{ color: "deeppurple", hex: "#673ab7" },
{ color: "lightblue", hex: "#5ac8fa" },
{ color: "teal", hex: "#009688" },
{ color: "lime", hex: "#cddc39" },
{ color: "deeporange", hex: "#ff6b22" }];



function timeago() {
	setTimeout(function() {
		$(".timeago").timeago()
	}, 150);
}


function DoMail() {
	let body = "Bonjour MyAfro Maps,\n\r\n\r";
	body += "Ci-dessous les informations concernant notre établissement : \n\r\n\r";
	body += "LOGO ou DEVANTURE DE L’ETABLISSEMENT\n\r\n\r";
	body += "2 PHOTOS DE VOS PRODUITS PHARES\n\r\n\r";
	body += "QU’AIMERIEZ VOUS OFFRIR A NOS AFROLOVERS? CHAMPS LIBRE OBLIGATOIRE\n\r\n\r";
	body += "PRISE D’UN RENDEZ VOUS : CADENDLY (https://calendly.com/myafromaps/partenariat?back=1&month=2022-02)\n\r\n\r";
	body += "NOM DU RESPONSABLE\n\r\n\r";
	body += "EMAIL VALIDE\n\r\n\r";
	body += "TELEPHONE\n\r\n\r";
	window.open("mailto:myafromaps@gmail.com?subject=ANNONCEURS&body=" + encodeURIComponent(body), '_system');
	
}

function GetDateitem(date, type) {
	let result = null;
	switch(type) {
		case "date": result = date.getDate();
			break;
		case "day": result = date.getDay();
			if (result == 1) result = "Lundi";
			else if (result == 2) result = "Mardi";
			else if (result == 3) result = "Mercredi";
			else if (result == 4) result = "Jeudi";
			else if (result == 5) result = "Vendredi";
			else if (result == 6) result = "Samedi";
			else if (result == 0) result = "Dimanche";
			break;
		case "month": result = date.getMonth();
			if (result == 0) result = "Janvier";
			else if (result == 1) result = "Février";
			else if (result == 2) result = "Mars";
			else if (result == 3) result = "Avril";
			else if (result == 4) result = "Mai";
			else if (result == 5) result = "Juin";
			else if (result == 6) result = "Juillet";
			else if (result == 7) result = "Août";
			else if (result == 8) result = "Septembre";
			else if (result == 9) result = "Octobre";
			else if (result == 10) result = "Novembre";
			else if (result == 11) result = "Décembre";
			break;
	}
	return result;
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

function GetSlots(data, duree) {
	let id = 0;
	for (let i = 0; i < data.length; i++) {
		if (data[i].opt_creneau.length > 0) {
			let slots = [];
			for(let j = 0; j < data[i].opt_creneau.length; j++) {
				let slot = data[i].opt_creneau[j];
				slot.start_time = data[i].date + "T" + slot.heure_debut + ".000";
				slot.start_time = new Date(slot.start_time);
				slot.end_time = data[i].date + "T" + slot.heure_fin + ".000";
				slot.end_time = new Date(slot.end_time);
				
				let nextSlotStart = slot.start_time;
				
				while (addMinutes(nextSlotStart, duree) <= slot.end_time) {
					let mySlot = {};
					mySlot.id = id;
					mySlot.parent = {
						"id": slot.id,
						"start": slot.start_time,
						"end": slot.end_time,
						"date_id": data[i].id
					};
					mySlot.start = nextSlotStart;
					mySlot.end = addMinutes(nextSlotStart, duree);
					mySlot.view = (mySlot.start.getHours() < 10) ? ("0" + mySlot.start.getHours().toString()) : mySlot.start.getHours().toString();
					mySlot.view += ":";
					mySlot.view += (mySlot.start.getMinutes() < 10) ? ("0" + mySlot.start.getMinutes().toString()) : mySlot.start.getMinutes().toString();
					//debugger;
					mySlot.op = slot.operator;
					nextSlotStart = mySlot.end;
					slots.push(mySlot);
					id++;
				}
			}
			if (slots.length > 0)
				data[i].slots = slots;
		}
	}
	return data;
}

function aleo(v) {
	$$('.zinconfort').hide();
	$f7.emit('zoneinconfort', v);
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    var dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

const getBase64FromUrl = async (url) => {
	const data = await fetch(url);
	const blob = await data.blob();
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.readAsDataURL(blob); 
		reader.onloadend = () => {
			const base64data = reader.result;   
			resolve(base64data);
		}
	});
}

function GoToPage(page, t) {
	if (t == undefined) t = 250;
	let id = "#tab-" + page + "-link";
	setTimeout(function() {
		$(id).trigger("click");
	}, t);
}

function GetFileName(preffix, filename, extension) {
	let ext = extension ? extension : (filename.split(".")[filename.split(".").length - 1]);
	let now = (new Date()).getTime();
	return  preffix + "_" + global.user.id + "_" + now + "." + ext;
}

var user_preferences = {
	sync_calendar: true,
	deactivate_account: false,
	close_account: false,
	twostep_verification: false,
	profile_visibility: "favorites",
	profile_information: "favorites",
	push_notifications: true,
	newsletter: false,
	offers_push: true,
	offers_email: false
};

let user_parameters = {
	p_synchro_calendar: true,
	p_account_active: true,
	p_2steps_verification: false,
	p_profile_visibility_fav: true,
	p_profile_data_fav: true,
	p_push_notifications: true,
	p_trends_notifications: true,
	p_offers_notifications_push: true,
	p_offers_notifications_email: false
};

//return a promise that resolves with a File instance
function urltoFile(url, filename, mimeType){
	return (fetch(url)
		.then(function(res){
			debugger;
			return res.arrayBuffer();
		})
		.then(function(buf){
			debugger;
			return new File([buf], filename, {type:mimeType});
		})
	);
}

/*function dataURLtoFile(dataurl, filename) {
	var arr = dataurl.split(','),
		mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]), 
		n = bstr.length, 
		u8arr = new Uint8Array(n);
	while(n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new File([u8arr], filename, {type:mime});
}*/

function dataURLtoFile(dataurl, filename) {
	var arr = dataurl.split(','),
		mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]), 
		n = bstr.length, 
		u8arr = new Uint8Array(n);
	while(n--){
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new File([u8arr], filename, {type:mime});
}

function b64toBlob(b64Data, contentType) {
	contentType = contentType || '';
	var sliceSize = 512;
	b64Data = b64Data.replace(/^[^,]+,/, '');
	b64Data = b64Data.replace(/\s/g, '');
	var byteCharacters = window.atob(b64Data);
	var byteArrays = [];

	for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
		var slice = byteCharacters.slice(offset, offset + sliceSize);
		var byteNumbers = new Array(slice.length);
		
		for (var i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
		}

		var byteArray = new Uint8Array(byteNumbers);

		byteArrays.push(byteArray);
	}

	var blob = new Blob(byteArrays, {type: contentType});
	return blob;
}

function fallingSky(base64str, filename, type, callback) {
	
	var pdfDetails = base64str; //base64
	contentType = type;
	var fileSystem;
	function onFs(fs) {
		fileSystem = fs;
		/** I'm hardcoding the filename here **/
		fs.root.getFile('image.png', {create: true, exclusive: false},
			function(fileEntry) {
				fileEntry.createWriter(function(fileWriter) {
					/*fileWriter.onwriteend = function(e) {
						fileEntry.file(function(file) {
							var sourceFilePath = file.localURL;
							//var targetFilePath = fileSystem.root.toURL() + fileDestPath + file.name;
							var deviceType = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : "null";
							var targetFilePath = (deviceType != "iPhone" && deviceType != "iPad") ? cordova.file.externalDataDirectory + file.name : cordova.file.tempDirectory + file.name;
							var ft = new FileTransfer();
							debugger;
							console.log(sourceFilePath + " / " + targetFilePath);
							callback(null);
						}, onError);
					};*/
					
					var blob = b64toBlob(pdfDetails , contentType);
					
					blob.name = filename;
					
					callback(blob);

					//fileWriter.write(blob);

				}, onError);

			}, onError
		);
	}
	
	if (window.hasOwnProperty("requestFileSystem"))
		window.requestFileSystem(TEMPORARY, 0, onFs, onError);
	
	/** General Error Catcher **/
	function onError(err) {
		console.log("Oops! : " , err);
	}
	
}



function LoadRealImg(time, params) {
	let t = time ? time : 0;
	if (window.hasOwnProperty("loadreal")) { console.warn("mthod called"); return; }
	window.loadreal = true;
	let isInViewport = function(element) {
		const rect = element.getBoundingClientRect();
		return (rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth));
	}
	let ScrollBindingCallback = function() {
		LoadAction();
	};
	let ScrollBinding = function() {
		if (params && params.hasOwnProperty("scrollable")) {
			params.scrollable.forEach(function(s) {
				let itemsSelector = document.querySelectorAll(s);
				itemsSelector.forEach(item => {
					item.removeEventListener('scroll', ScrollBindingCallback);
					item.addEventListener('scroll', ScrollBindingCallback);
				});
			});
		}
	};
	let LoadAction = function() {
		$$('[real-src], [back-src]').each(function(e) {
			const onLoadFn = function(evt) {
				downloadingImage.removeEventListener("load", onLoadFn, true);
				evt.preventDefault();
				evt.stopPropagation();
				if (e.tagName == 'IMG') e.src = this.src;
				else e.style.backgroundImage = "url('" + this.src + "')";
			};
			if (!isInViewport(e)) return;
			let isBack = e.attributes.hasOwnProperty("back-src");
			let imgurl = isBack ? e.attributes["back-src"].value : e.attributes["real-src"].value;
			let backurl = window.getComputedStyle(e, null).getPropertyValue('background-image');
			if (!imgurl || !imgurl.startsWith("http")) return;
			if (!isBack && e.src == imgurl) return;
			else if (isBack && backurl == imgurl) return;
			else if (isBack) {
				backurl = backurl.replace("url('", "").replace('url("', '').replace('")', '').replace("')", "");
				if (backurl == imgurl) return;
			}
			//console.log("downloading  : " + imgurl);
			var downloadingImage = new Image();
			downloadingImage.addEventListener("load", onLoadFn, true);
			downloadingImage.src = imgurl;
		});
		ScrollBinding();
	}
	setTimeout(function() { LoadAction() }, t);
	document.body.addEventListener('DOMSubtreeModified', function() {
		setTimeout(function() { LoadAction(); }, 100);
		ScrollBinding();
	}, false);
}

//LoadRealImg(0, { scrollable: [".page-content"]});
//LoadRealImg(0, { scrollable: [".page-content", ".sub_trends_area .scroller"]});



function GetSentences() {
	supe.from("Phrases")
	.select("*")
	.then((response) => {
		global.sentences = response.data;
		$f7.emit('got_sentences', response.data);
	}).catch((error) => {
		debugger;
		let local_sentences = [{"id":1,"key":"homepage_st1","value":"La communauté"}, {"id":2,"key":"homepage_st2","value":"Des porteurs de lunettes et des opticiens engagés"}, {"id":5,"key":"opticiens_discover","value":"Des professionnels de santé engagés qui font du bien voir une priorité pour votre bonheur et qui font bien etre sociétal et environnemental un devoir."}, {"id":6,"key":"garanties_sav","value":"Sélectionnez une option pour plus d'informations."}, {"id":8,"key":"monprofil_intro","value":"Gérez vos informations personnelles de profil en toute sécurité."}, {"id":9,"key":"vsg_takepic","value":"Commencez par prendre une photo ou importer de votre galerie"}, {"id":10,"key":"vsg_swipe","value":"Swiper vers le haut ou le bas pour essayer les différentes formes de visage"}, {"id":11,"key":"contact_intro","value":"N'hésitez pas à nous laisser un message en cas de question sans réponse via le formulaire ci-dessous"}, {"id":3,"key":"tendances_st1","value":"RESTEZ INFORMÉ DES"}, {"id":4,"key":"tendances_st2","value":"DERNIERES TENDANCES"}, {"id":7,"key":"essayages_intro","value":"Importer les images de vos essayages depuis votre bibiothèque de photos locale"}, {"id":12,"key":"ofl_1","value":"Votre guide pour choisir vos lunettes."}, {"id":13,"key":"ofl_2","value":"Vos critères, vos choix."}, {"id":14,"key":"ofl_3","value":"Une expérience client intuitive avec des opticiens au service de votre vision"},  {"id":15,"key":"ofl_4","value":"Vivez une expérience"}, {"id":16,"key":"ofl_5","value":"unique."}];
		global.sentences = local_sentences;
		$f7.emit('got_sentences', local_sentences);
		//console.warn(error);
	});
}

function GiresseStyle() {
	$$("").css("background-color", "");
	$$('.main-bg').css({
		"background-image": "url(assets/img/optic2.jpg)",
    	"background-size": "auto 100%",
    	"background-repeat": "no-repeat",
    	"background-position": "center",
    	"background-color": "#1A3D87"
	});
	$$(".header_osf").hide();
	$$(".tabs.opt .page-content.tab").css({
		"padding-top": "55px"
	});
	$$(".icon.material-icons.if-md").css("color", "#FFF");
	$$(".page.page-home .right .link i").css("color", "#FFF");
	$$(".rdv_list").css("margin-top", "-37px");
	$$(".closer").css("display", "none");
	$$("#tab-rdv").css("padding-top", "93px");

	/*
	cordova.plugins.notification.local.schedule({
		title: 'Optic Store Finder',
		text: 'Rappel consultation optique (KRYS)...',
		trigger: { in: 5, unit: 'second' }
	});

	cordova.plugins.notification.local.schedule({
		title: 'Optic Store Finder',
		text: 'Rappel consultation optique (KRYS)...',
		trigger: { in: 15, unit: 'second' }
	});

	cordova.plugins.notification.local.schedule({
		title: 'Optic Store Finder',
		text: 'Rappel consultation optique (KRYS)...',
		trigger: { in: 1, unit: 'minute' },
    	foreground: true
	});*/
}

function SeConnecter() {
	GoToPage("user", 0);
	document.querySelector('.OpticFirstLaunch').remove();
}



function getKey(obj, search) {
	let v = "";
	Object.keys(obj).forEach(function(key) {
		if (obj[key]["key"] == search)
			v = obj[key]["value"];
	});
	return v;
};


function OpenLink(url) {
	if (!window.hasOwnProperty("cordova")) {
		window.open(encodeURI(url), '_blank', 'location=no');
		return;
	}
	cordova.InAppBrowser.open(url, '_system');
}

function getUserData(callback) {
	supe.from('users')
	.select('p_2steps_verification, p_account_active, p_offers_notifications_email, p_offers_notifications_push, p_profile_data_fav, p_profile_visibility_fav, p_push_notifications, p_synchro_calendar, p_trends_notifications')
	.eq("id", global.user.id)
	.then(function(e) {
		if (e.error) console.warn(e.error.message);
		else {
			global.user_params = e.data[0];
			if (callback) callback(e.data[0]);
		}
	})
	.catch(function(e) {
		console.warn(e)
	});
};

function isObjectEqual(object1, object2) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (const key of keys1) {
        const val1 = object1[key];
        const val2 = object2[key];
        const areObjects = isObject(val1) && isObject(val2);
        if ((areObjects && !isObjectEqual(val1, val2)) || (!areObjects && val1 !== val2)) {
            return false;
        }
    }
    return true;
}
function isObject(object) {
    return object != null && typeof object === "object";
}


