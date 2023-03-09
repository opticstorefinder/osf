MyApp.angular.controller('MainController', ['$scope', '$compile', '$rootScope', function($scope, $compile, $rootScope) {
    
    global.compiledpages = [];
	var self = this;
    var compiledonce = ["home", "tabs-swipeable", "catalog", "business"];
	
	$scope.code = "";
	$scope.view = "vente"; //tickets, catalog, clients, stats, parametres
	
    self.savedArticles = [];

	self.current = {
        image: "assets/img/no2.png"
    };

	$scope.current = self.current;

	$scope.menu = [{
		name: "Accordion",
		path: "/accordion/"
	}, {
		name: "Action sheet",
		path: "/action-sheet/"
	}, {
		name: "Badge",
		path: "/badge/"
	}, {
		name: "Buttons",
		path: "/buttons/"
	}, {
		name: "Cards",
		path: "/cards/"
	}, {
		name: "Checkbox",
		path: "/checkbox/"
	}, {
		name: "Chips/Tags",
		path: "/chips/"
	}, {
		name: "Contacts List",
		path: "/contacts-list/"
	}, {
		name: "Data Table",
		path: "/data-table/"
	}];

    var cancompile = function(e) {
        let res = true;
		let PageName = e.detail.name;
		let PageFrom = "";
		if (!PageName || PageName == null) return;
		if (e.detail.hasOwnProperty("pageFrom")) {
			if (e.detail.pageFrom && e.detail.pageFrom.hasOwnProperty("name"))
				PageFrom = e.detail.pageFrom.name;
		}
        if ((compiledonce.indexOf(PageName) >= 0) &&            // Page should be compiled once
            (global.compiledpages.indexOf(PageName) >= 0)) {    // Page has already been compiled
            res = false;
        }
		else {
			console.log(PageFrom + "/" + PageName);
			if (((PageFrom == "home") && (PageName == "opticien")) ||
				((PageFrom == "home") && (PageName == "opticiens")) ||
				((PageFrom == "rendezvous") && (PageName == "opticien")) ||
				((PageFrom == "profile") && (PageName == "home")) ||
				((PageFrom == "howitworks") && (PageName == "home")) ||
				((PageFrom == "aftersale") && (PageName == "home")) ||
				((PageFrom == "aftersale") && (PageName == "rendezvous")) ||
				((PageFrom == "rendezvous") && (PageName == "aftersale")) ||
				((PageFrom == "rendezvous") && (PageName == "clickncollect")) ||
				((PageFrom == "clickncollect") && (PageName == "rendezvous")) ||
				((PageFrom == "engagements") && (PageName == "opticien")) ||
				((PageFrom == "contact") && (PageName == "home")) ||
				((PageFrom == "independants") && (PageName == "home")) ||
				((PageFrom == "parameters") && (PageName == "home")) ||
				((PageFrom == "opticien") && (PageName == "home")) ||
				((PageFrom == "opticiens") && (PageName == "home")) ||
				((PageFrom == "opticiens") && (PageName == "opticien")) ||
				((PageFrom == "opticien") && (PageName == "opticiens")) ||
				((PageFrom == "opticien") && (PageName == "favorites")) ||
				((PageFrom == "engagements") && (PageName == "home")) ||
				((PageFrom == "parameters-perso") && (PageName == "parameters")) ||
				((PageFrom == "parameters") && (PageName == "home"))
			) {
				res = false;
			}
		}
        return res;
    };


	$scope.init = function() {
		let saved = localStorage.getItem("savedArticles");
		self.savedArticles = saved ? JSON.parse(saved) : [];
		self.sync();
	};

    //$$(document).on('page:afterin', function(e) {
    $$(document).on('page:beforein', function(e) {
        // Never recompile index page
        var page = e.detail;
		//console.log("compiling maybe !");
        //if (cancompile(page.name) || (e.target.className.indexOf("ng-scope")<=0)) {
		if (cancompile(e) || (e.target.className.indexOf("ng-scope")<=0)) {
            // Ajax pages must be compiled first
			$compile(e.target)($scope);
			if (!$scope.$$phase) {
				$scope.$digest();
				$scope.$apply();
			}
            //$scope.$apply();
            if (global.compiledpages.indexOf(page.name) < 0) {
                global.compiledpages.push(page.name);
            }
        }
        // Send broadcast event when switching to new page
        $rootScope.$broadcast(page.name + 'PageEnter', e);
    });
	/*
	$$(document).on('popup:open', function (e) {
		$compile(e.target)($scope);
        $scope.$apply();
        // Send broadcast event when switching to new page
        $rootScope.$broadcast('PopupEnter', e);
	});*/

    $$(document).on('pageAfterAnimation', function(e) {
        // Send broadcast if a page is left
        var fromPage = e.detail.page.fromPage;
		//console.log("compiling !");
        if (fromPage) {
            $rootScope.$broadcast(fromPage.name + 'PageLeave', e);
            if (fromPage.name != 'tabs-swipeable') {
				debugger;
                var prevPage = angular.element(document.querySelector('#'+fromPage.name));
                prevPage.remove();
            }
        }
    });
	
	$$(document).on('page:beforeout', function(e) {
		if (e.detail.name == "parameters") {
			if (!isObjectEqual(global.user_params, global.user_params_before)) {
				let data = angular.copy(global.user_params);
				delete data.no_p_profile_data_fav;
				delete data.no_p_profile_visibility_fav;
				supe.from('users')
				.update(data)
				.eq("id", global.user.id)
				.then(function(e) {
					if (e.error) console.warn(e.error.message);
					else {
						debugger;
					}
				})
				.catch(function(e) {
					console.warn(e)
				});
			}
		}
    });

	$$(document).on('page:afterout', function(e) {
		ManageHistory();
    });
	
	$scope.Pay = function() {
		//MyApp.fw7.app.views.main.router.navigate('/page1/');
	};
	
	$scope.SetProfile = function(a) {
		$scope.profile = a;
		$scope.store_name = MyApp.ax.store.get("store")["name"];
		self.sync();
	};
	
	$scope.SetCode = function() {
		$scope.code = global.code;
		self.sync();
	};
    
	$scope.SetBrands = function() {
		let el = document.getElementById('HomePage');
		if (el) angular.element(el).scope().ResizeBrands();
	};
	
	$scope.SetHome = function() {
		$scope.view = "vente";
		self.sync();
	};
	
	$scope.OpenPanel = function() {
		setTimeout(function() {
			panelLeft.open(true);
		}, 50);
	};
	
    self.sync = function () {
        if (!$scope.$$phase) {
            $scope.$digest();
            $scope.$apply();
        }
    };
	
	$scope.firstconnexion = false;
	
    $scope.SaveArticle = function(article, state=true) {
        debugger;
        let saveArticle = {};
        saveArticle.id = article.id;
        if (state)  {
			article.saved = true;
			self.savedArticles.push(saveArticle);
		}
        else {
			article.saved = false;
			for(let i = 0; i < self.savedArticles.length; i++) {
				if (self.savedArticles[i].id == saveArticle.id) {
					self.savedArticles.splice(i, 1);
				}
			}
		}
        if (article.top == true) {
            saveArticle.top = true;
        }
        
        localStorage.setItem("savedArticles", JSON.stringify(self.savedArticles));
		MyApp.fw7.app.emit("new_article");
        self.sync();
    };

    $scope.Share = function() {
        let url = "https://apps.axelib.io/custom/opticstorefinder/article.php?id=" + $scope.current.id;
        if (window.hasOwnProperty("plugins")) {
            if (window.plugins.hasOwnProperty("socialsharing")) {
                window.plugins.socialsharing.share($scope.current.titre, "Optic Store Finder : Tendances", $scope.current.image, url);
            }
            else alert("window.plugins has no socialsharing property");
        }
        else alert("window has no plugins property");
    };

    $scope.ShareFacebook = function() {
        let url = "https://apps.axelib.io/custom/opticstorefinder/article.php?id=" + $scope.current.id;
        if (window.hasOwnProperty("plugins")) {
            if (window.plugins.hasOwnProperty("socialsharing")) {
                //window.plugins.socialsharing.share($scope.current.titre, "Optic Store Finder : Tendances", $scope.current.image, url);
				window.plugins.socialsharing.shareViaFacebook($scope.current.titre, $scope.current.image, url, function() {console.log('share ok')}, function(errormsg){alert(errormsg)});
            }
            else alert("window.plugins has no socialsharing property");
        }
        else alert("window has no plugins property");
    };

    $scope.ShareInstagram = function() {
        let url = "https://apps.axelib.io/custom/opticstorefinder/article.php?id=" + $scope.current.id;
        if (window.hasOwnProperty("plugins")) {
            if (window.plugins.hasOwnProperty("socialsharing")) {
                //window.plugins.socialsharing.share($scope.current.titre, "Optic Store Finder : Tendances", $scope.current.image, url);
				window.plugins.socialsharing.shareViaInstagram($scope.current.titre, $scope.current.image, function() {console.log('share ok')}, function(errormsg){alert(errormsg)});
            }
            else alert("window.plugins has no socialsharing property");
        }
        else alert("window has no plugins property");
    };

	MyApp.fw7.app.on("readarticle", function(article) {
		$scope.current = article;
		self.sync();
	});


	$$('.sheet-modal.my-sheet-swipe-to-close').on('sheet:open', function (e) {
		$scope.current = self.current;
		self.sync();
		self.GetSingleArticle();
	});
	
    self.GetSingleArticle = function() {
        $f7.preloader.show();
        setTimeout(function() {
            if (!global.article_id) {
                $f7.preloader.hide();
                return;
            }
            let id = global.article_id.toString();
            supe.from('tendances_articles')
            .select("*")
            .eq('id', global.article_id)
            .then((response) => {
                $f7.preloader.hide();
                if (!response.error) {
                    global.article_id = null;
                    $scope.current = response.data[0];
					/** check if saved */
					let saved = localStorage.getItem("savedArticles");
					if (saved) {
						saved = JSON.parse(saved);
						for(let i = 0; i < saved.length; i++) {
							if (saved[i].id == $scope.current.id) {
								$scope.current.saved = true;
							}
						}
					}
					/***/
                    self.sync();
                }
            }).catch((error) => {
                $f7.preloader.hide();
                console.warn(error);
            });
        }, 250)
    };

}]);