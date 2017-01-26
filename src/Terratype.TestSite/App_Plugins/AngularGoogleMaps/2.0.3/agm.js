(function (root) {
    var agm = {
        DOWNLOAD_TIMEOUT: 1000 * 30,	//	How long do we try and download google maps in millisecs before we give in
        REFRESH_POLL: 250,              //  How often do we check to see if map has changed
        COORD_POLL: 1000,               //  How often do we check the coords entered by user
        COORD_DECIMAL_PLACES: 6,        //  Limit coordinates to how many decimal places
        COORD_DEFAULT: '55.4063207,10.3870147,17', //  Default location. This is Umbraco HQ
        SEARCH_TEST: 'Paris, France',   //  Location we test for, if we get results then we know we have Google Places API Web Service enabled
        DEFAULT_ZOOM: 17,               //  Default zoom
        ZOOM_MIN: 1,                    //  Minimum zoom
        ZOOM_MAX: 20,                   //  Maximum zoom
        apiKey: '',
        coordinateSystem: 'WGS-84',
        searchStatus: '',
        searchBoundaryCountry: '',
        module: null,
	    mapStatus: null,
	    mapStatusTimer: null,
	    originalConsole: null,
	    eventMapLoading: [],
	    eventMapLoadFailed: [],
	    eventMapLoadSuccess: [],
        showPlacesServiceEnabled: null,
        gateController: 0,
	    installScript: function (url, options) {
	        //  Load scripts
	        options = jQuery.extend(options || {}, {
	            dataType: 'script',
	            cache: true,
	            url: url
	        });
	        return jQuery.ajax(options);
	    },
	    uninstallScript: function (url) {
	        var matches = document.getElementsByTagName('script');
	        for (var i = matches.length; i >= 0; i--) {
	            var match = matches[i];
	            if (match && match.getAttribute('src') != null && match.getAttribute('src').indexOf(url) != -1) {
	                match.parentNode.removeChild(match)
	            }
	        }
	    },
	    installFakeConsole: function () {
	        agm.ApiKeyError = 0;
	        if (typeof (root.console.agmfake) === 'undefined') {
	            agm.originalConsole = root.console;
	            root.console = agm.fakeConsole;
	        }
	    },
	    uninstallFakeConsole: function () {
	        root.console = agm.originalConsole;
	    },
	    isGoogleMapsLoaded: function () {
	        return angular.isDefined(window.google) && angular.isDefined(window.google.maps);
	    },
	    fakeConsole: {
            agmfake: 'fake',
	        error: function (a) {
	            if ((a.indexOf('Google Maps API') != -1 || a.indexOf('Google Maps Javascript API') != -1) &&
                    (a.indexOf('MissingKeyMapError') != -1 || a.indexOf('ApiNotActivatedMapError') != -1 || 
                    a.indexOf('InvalidKeyMapError') != -1 || a.indexOf('not authorized') != -1 || a.indexOf('RefererNotAllowedMapError') != -1)) {
	                agm.ApiKeyError++;
	                if (agm.mapStatus != false) {
	                    agm.hideMap();
	                }
	            }
	            try {
	                agm.originalConsole.error(a);
	            }
	            catch (oh) {
	            }
	        },
	        warn: function (a) {
	            //if (a.indexOf('Google Maps API') != -1 && a.indexOf('NoApiKeys') != -1) {
	            //    agm.ApiKeyError++;
	            //    if (agm.mapStatus != false) {
	            //        agm.hideMap();
	            //    }
                //}
	            try {
	                agm.originalConsole.warn(a);
	            }
	            catch (oh) {
	            }
	        },
	        log: function (a) {
	            try {
	                agm.originalConsole.log(a);
	            }
	            catch (oh) {
	            }
	        }
	    },
	    uninstallMap: function () {
	        agm.uninstallScript('//maps.googleapis.com/');
	        delete google;
	    },
	    loadMap: function () {
	        //  Initialize map
	        if (agm.eventMapLoading != null) {
	            angular.forEach(agm.eventMapLoading, function (value, key) {
	                value();
	            });
	        }
	        agm.installFakeConsole();
	        agm.uninstallMap();
	        setTimeout(function () {
	            agm.mapStatus = null;
	            var apiKey = '';
	            if (agm.apiKey != '') {
	                apiKey = '&key=' + agm.apiKey;
	            }
	            var domain = 'maps.googleapis.com';
	            if (agm.coordinateSystem == 'GCJ-02') {
	                domain = 'maps.google.cn';
	            }

	            agm.installScript('//' + domain + '/maps/api/js?v=3&sensor=true&libraries=places&callback=AGM4bf1a78e00984aebbf1b1ce0c260d6dbCallback' + apiKey).done(function (script, textStatus) {
	                //	Do nothing, as google will execute our callback directly
	            }).fail(function (jqxhr, settings, exception) {
	                agm.hideMap();
	            });

	            agm.mapStatusTimer = setTimeout(agm.hideMap, agm.DOWNLOAD_TIMEOUT);
	        }, 1);
	        root.AGM4bf1a78e00984aebbf1b1ce0c260d6dbCallback = function () {
	            delete root.AGM4bf1a78e00984aebbf1b1ce0c260d6dbCallback;
	            //  Successfully loaded map
	            var timer = setInterval(function () {
	                if (agm.isGoogleMapsLoaded()) {
	                    clearInterval(timer);
	                    agm.showMap.call(agm);
	                }
	            }, agm.REFRESH_POLL);
	        }
	    },
	    hideMap: function () {
	        //  Fail to load map
	        agm.mapStatus = false;
	        agm.uninstallFakeConsole();
	        if (agm.mapStatusTimer != null) {
	            clearTimeout(agm.mapStatusTimer);
	        }
	        agm.uninstallScript('//maps.googleapis.com/');
	        if (agm.hideMapEvent != null) {
	            agm.hideMapEvent();
	        }
	        if (agm.eventMapLoadFailed != null) {
	            angular.forEach(agm.eventMapLoadFailed, function (value, key) {
	                value();
	            });
	        }
	    },
	    showMap: function () {
	        //  Google map has loaded, but there still might be an issue with keys
	        agm.mapStatus = true;
	        if (agm.mapStatusTimer != null) {
	            clearTimeout(agm.mapStatusTimer);
	        }
	        if (agm.eventMapLoadSuccess != null) {
	            angular.forEach(agm.eventMapLoadSuccess, function (value, key) {
	                value();
	            });
	        }
	    },
	    setDefinitionDefaults: function (definition) {
	        if (typeof (definition.apiKey) === 'undefined') {
	            definition.apiKey = '';
	        }
	        if (typeof (definition.coordinateSystem) === 'undefined') {
	            definition.coordinateSystem = 'WGS-84';
	        }
	        if (typeof (definition.search) === 'undefined' || typeof (definition.search.status) === 'undefined') {
	            definition.search.status = 'hide';
	        }
	        if (typeof (definition.search) === 'undefined' || typeof (definition.search.limit) === 'undefined' || typeof (definition.search.limit.country) === 'undefined') {
	            definition.search.limit.country = '';
	        }
	    },
	    init: function () {
	        agm.uninstallMap();
	        //agm.module = angular.module('AGM');
	        //app.requires.push('AGM');

	        //  Controller for API Key
	        angular.module('umbraco').controller('agmConfigDefinition', ['$scope', function ($scope) {
	            $scope.initConfig = function () {
	                $scope.showPlacesService = false;
	                if (typeof ($scope.model.value) == 'string') {
	                    $scope.model.value = JSON.parse($scope.model.value);
	                }
	                agm.setDefinitionDefaults($scope.model.value);
	                agm.apiKey = $scope.model.value.apiKey;
	                agm.coordinateSystem = $scope.model.value.coordinateSystem;
	                agm.searchStatus = $scope.model.value.search.status;
	                agm.searchBoundaryCountry = $scope.model.value.search.limit.country;
	                agm.eventMapLoading.push(function () {
	                    $scope.showLoading = true;
	                    $scope.showFailed = false;
	                    $scope.showSuccess = false;
	                    //$scope.$apply();
	                });
	                agm.eventMapLoadFailed.push(function () {
	                    $scope.showLoading = false;
	                    $scope.showFailed = true;
	                    $scope.showSuccess = false;
	                    //$scope.$apply();
	                });
	                agm.eventMapLoadSuccess.push(function () {
	                    $scope.showLoading = false;
	                    $scope.showFailed = false;
	                    $scope.showSuccess = true;
	                    //$scope.$apply();
	                });
	                agm.showPlacesServiceEnabled = function (b) {
	                    $scope.showPlacesService = !b;
	                    //$scope.$apply();
	                }

	                setTimeout(agm.loadMap, 1);
	            }
	        }]);

	        //  Controller for Icon
	        angular.module('umbraco').controller('agmConfigIcon', ['$scope', '$timeout', function ($scope, $timeout) {
	            angular.extend($scope, {
	                predefineIndex: '0',
	                anchorHorizontalManual: '',
	                anchorHorizontalAutomatic: 'center',
	                anchorVerticalManual: '',
	                anchorVerticalAutomatic: 'bottom',
	                isAnchorHorizontalManual: true,
	                isAnchorVerticalManual: true,
	                initialize: function () {
	                    if (typeof ($scope.model.value) == 'string') {
	                        $scope.model.value = JSON.parse($scope.model.value);
	                    }

	                    $scope.predefineIndex = '0';
	                    for (var i = 1; i != $scope.predefines.length; i++) {
	                        if ($scope.predefines[i].image == $scope.model.value.image) {
	                            $scope.predefineIndex = String(i);
	                            break;
	                        }
	                    }
	                    $scope.map();
	                },
	                predefines: [
                        {
                            name: '-- Custom --',
                            image: '',
                            shadowImage: '',
                            size: {
                                width: 32,
                                height: 32
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'bottom'
                            }
                        },
                        {
                            name: 'Red Marker',
                            image: 'https://mt.google.com/vt/icon/name=icons/spotlight/spotlight-poi.png',
                            shadowImage: '',
                            size: {
                                width: 22,
                                height: 40
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'bottom'
                            }
                        },
                        {
                            name: 'Green Marker',
                            image: 'https://mt.google.com/vt/icon?psize=30&font=fonts/arialuni_t.ttf&color=ff304C13&name=icons/spotlight/spotlight-waypoint-a.png&ax=43&ay=48&text=%E2%80%A2',
                            shadowImage: '',
                            size: {
                                width: 22,
                                height: 43
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'bottom'
                            }
                        },
                        {
                            name: 'Blue Marker',
                            image: 'https://mt.google.com/vt/icon/name=icons/spotlight/spotlight-waypoint-blue.png',
                            shadowImage: '',
                            size: {
                                width: 22,
                                height: 40
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'bottom'
                            }
                        },
                        {
                            name: 'Purple Marker',
                            image: 'https://mt.google.com/vt/icon/name=icons/spotlight/spotlight-ad.png',
                            shadowImage: '',
                            size: {
                                width: 22,
                                height: 40
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'bottom'
                            }
                        },
                        {
                            name: 'Gold Star',
                            image: 'https://mt.google.com/vt/icon/name=icons/spotlight/star_L_8x.png&scale=2',
                            shadowImage: '',
                            size: {
                                width: 42,
                                height: 42
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'center'
                            }
                        },
                        {
                            name: 'Grey Home',
                            image: 'https://mt.google.com/vt/icon/name=icons/spotlight/home_L_8x.png&scale=2',
                            shadowImage: '',
                            size: {
                                width: 48,
                                height: 48
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'center'
                            }
                        },
                        {
                            name: 'Red Shopping Cart',
                            image: 'https://mt.google.com/vt/icon/name=icons/spotlight/supermarket_search_L_8x.png&scale=2',
                            shadowImage: '',
                            size: {
                                width: 48,
                                height: 48
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'center'
                            }
                        },
                        {
                            name: 'Blue Shopping Cart',
                            image: 'https://mt.google.com/vt/icon/name=icons/spotlight/supermarket_L_8x.png&scale=2',
                            shadowImage: '',
                            size: {
                                width: 48,
                                height: 48
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'center'
                            }
                        },
                        {
                            name: 'Red Hot Spring',
                            image: 'https://mt.google.com/vt/icon/name=icons/spotlight/jp/hot_spring_search_L_8x.png&scale=2',
                            shadowImage: '',
                            size: {
                                width: 48,
                                height: 48
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'center'
                            }
                        },
                        {
                            name: 'Red Dharma',
                            image: 'https://mt.google.com/vt/icon/name=icons/spotlight/worship_dharma_search_L_8x.png&scale=2',
                            shadowImage: '',
                            size: {
                                width: 48,
                                height: 48
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'center'
                            }
                        },
                        {
                            name: 'Brown Dharma',
                            image: 'https://mt.google.com/vt/icon/name=icons/spotlight/worship_dharma_L_8x.png&scale=2',
                            shadowImage: '',
                            size: {
                                width: 48,
                                height: 48
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'center'
                            }
                        },
                        {
                            name: 'Red Jain',
                            image: 'https://mt.google.com/vt/icon/name=icons/spotlight/worship_jain_search_L_8x.png&scale=2',
                            shadowImage: '',
                            size: {
                                width: 48,
                                height: 48
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'center'
                            }
                        },
                        {
                            name: 'Brown Jain',
                            image: 'https://mt.google.com/vt/icon/name=icons/spotlight/worship_jain_L_8x.png&scale=2',
                            shadowImage: '',
                            size: {
                                width: 48,
                                height: 48
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'center'
                            }
                        },
                        {
                            name: 'Red Shopping',
                            image: 'https://mt.google.com/vt/icon/name=icons/spotlight/shopping_search_L_8x.png&scale=2',
                            shadowImage: '',
                            size: {
                                width: 48,
                                height: 48
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'center'
                            }
                        },
                        {
                            name: 'Blue Shopping',
                            image: 'https://mt.google.com/vt/icon/name=icons/spotlight/shopping_L_8x.png&scale=2',
                            shadowImage: '',
                            size: {
                                width: 48,
                                height: 48
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'center'
                            }
                        },
                        {
                            name: 'Red Harbour',
                            image: 'https://mt.google.com/vt/icon/name=icons/spotlight/harbour_search_L_8x.png&scale=2',
                            shadowImage: '',
                            size: {
                                width: 48,
                                height: 48
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'center'
                            }
                        },
                        {
                            name: 'Blue Harbour',
                            image: 'https://mt.google.com/vt/icon/name=icons/spotlight/harbour_L_8x.png&scale=2',
                            shadowImage: '',
                            size: {
                                width: 48,
                                height: 48
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'center'
                            }
                        },
                        {
                            name: 'Blue Harbour',
                            image: 'https://mt.google.com/vt/icon/name=icons/spotlight/harbour_L_8x.png&scale=2',
                            shadowImage: '',
                            size: {
                                width: 48,
                                height: 48
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'center'
                            }
                        },
                        {
                            name: 'Orange Umbraco',
                            image: '/umbraco/assets/img/application/logo.png',
                            shadowImage: '',
                            size: {
                                width: 32,
                                height: 32
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'center'
                            }
                        },
                        {
                            name: 'Black Umbraco',
                            image: '/umbraco/assets/img/application/logo_black.png',
                            shadowImage: '',
                            size: {
                                width: 32,
                                height: 32
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'center'
                            }
                        },
                        {
                            name: 'White Umbraco',
                            image: '/umbraco/assets/img/application/logo_white.png',
                            shadowImage: '',
                            size: {
                                width: 32,
                                height: 32
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'center'
                            }
                        },
                        {
                            name: 'Red Circle',
                            image: 'https://mt.google.com/vt/icon/name=icons/spotlight/generic_search_L_8x.png&scale=2',
                            shadowImage: '',
                            size: {
                                width: 48,
                                height: 48
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'center'
                            }
                        },
                        {
                            name: 'Orange Circle',
                            image: 'https://mt.google.com/vt/icon/name=icons/spotlight/ad_L_8x.png&scale=2',
                            shadowImage: '',
                            size: {
                                width: 48,
                                height: 48
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'center'
                            }
                        },
                        {
                            name: 'Brown Circle',
                            image: 'https://mt.google.com/vt/icon/name=icons/spotlight/generic_establishment_v_L_8x.png&scale=2',
                            shadowImage: '',
                            size: {
                                width: 48,
                                height: 48
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'center'
                            }
                        },
                        {
                            name: 'Green Circle',
                            image: 'https://mt.google.com/vt/icon/name=icons/spotlight/generic_recreation_v_L_8x.png&scale=2',
                            shadowImage: '',
                            size: {
                                width: 48,
                                height: 48
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'center'
                            }
                        },
                        {
                            name: 'Blue Circle',
                            image: 'https://mt.google.com/vt/icon/name=icons/spotlight/generic_retail_v_L_8x.png&scale=2',
                            shadowImage: '',
                            size: {
                                width: 48,
                                height: 48
                            },
                            anchor: {
                                horizontal: 'center',
                                vertical: 'center'
                            }
                        },
	                ],
	                bindPredefines: function (index) {
	                    $scope.model.value.name = $scope.predefines[index].name;
	                    $scope.model.value.image = $scope.predefines[index].image;
	                    $scope.model.value.shadowImage = $scope.predefines[index].shadowImage;
	                    $scope.model.value.size = $scope.predefines[index].size;
	                    $scope.model.value.anchor = $scope.predefines[index].anchor;
	                },
	                map: function (index) {
	                    if (typeof (index) === 'undefined') {
	                        index = Number($scope.predefineIndex);
	                    }

	                    if (index < 0 || index >= $scope.predefines.length) {
	                        index = 0;
	                    }

	                    if (index != 0) {
	                        $scope.bindPredefines(index);
	                    } else {
	                        if (typeof ($scope.model.value.name) === 'undefined') {
	                            $scope.model.value.name = $scope.predefines[index].name;
	                        }
	                        if (typeof ($scope.model.value.image) === 'undefined') {
	                            $scope.model.value.image = $scope.predefines[index].image;
	                        }
	                        if (typeof ($scope.model.value.shadowImage) === 'undefined') {
	                            $scope.model.value.shadowImage = $scope.predefines[index].shadowImage;
	                        }
	                        if (typeof ($scope.model.value.size) === 'undefined') {
	                            $scope.model.value.size = $scope.predefines[index].size;
	                        }
	                        if (typeof ($scope.model.value.anchor) === 'undefined') {
	                            $scope.model.value.anchor = $scope.predefines[index].anchor;
	                        }
	                    }

	                    if (isNaN($scope.model.value.anchor.horizontal)) {
	                        $scope.isAnchorHorizontalManual = false;
	                        $scope.anchorHorizontalManual = '';
	                        $scope.anchorHorizontalAutomatic = $scope.model.value.anchor.horizontal;
	                    } else {
	                        $scope.isAnchorHorizontalManual = true;
	                        $scope.anchorHorizontalManual = $scope.model.value.anchor.horizontal;
	                        $scope.anchorHorizontalAutomatic = 'center';
	                    }

	                    if (isNaN($scope.model.value.anchor.vertical)) {
	                        $scope.isAnchorVerticalManual = false;
	                        $scope.anchorVerticalManual = '';
	                        $scope.anchorVerticalAutomatic = $scope.model.value.anchor.vertical;
	                    } else {
	                        $scope.isAnchorVerticalManual = true;
	                        $scope.anchorVerticalManual = $scope.model.value.anchor.vertical;
	                        $scope.anchorVerticalAutomatic = 'bottom';
	                    }
	                    $scope.removeBlankOptions();
	                },
	                setPredefine: function () {
	                    if ($scope.predefineIndex == '0') {
	                        $scope.bindPredefines(0);
	                    }
	                    $scope.map();
	                },
	                removeBlankOptions: function () {
	                    $timeout(function () {
	                        if (jQuery('.angulargoolemapsConfigIcon option[value*="?"]').length != 0) {
	                            jQuery('.angulargoolemapsConfigIcon option[value*="?"]').remove();
	                        }
	                    });
	                },
	                setHorizontal: function () {
	                    if ($scope.isAnchorHorizontalManual) {
	                        $scope.model.value.anchor.horizontal = $scope.anchorHorizontalManual;
	                    } else {
	                        $scope.anchorHorizontalManual = '';
	                        $scope.model.value.anchor.horizontal = $scope.anchorHorizontalAutomatic;
	                    }
	                    $scope.predefineIndex = '0';
	                    $scope.removeBlankOptions();
	                },
	                setVertical: function () {
	                    if ($scope.isAnchorVerticalManual) {
	                        $scope.model.value.anchor.vertical = $scope.anchorVerticalManual;
	                    } else {
	                        $scope.anchorVerticalManual = '';
	                        $scope.model.value.anchor.vertical = $scope.anchorVerticalAutomatic;
	                    }
	                    $scope.predefineIndex = '0';
	                    $scope.removeBlankOptions();
	                },
	                iconUrl: function (url) {
	                    return agm.configIconUrl(url);
	                }
	            });
	        }]);

	        //  DataType Controller
	        angular.module('umbraco').controller('agmConfigDefaultLocation', ['$scope', function ($scope) {
	            var jsonModel = agm.decode($scope.model.value);
	            if (typeof jsonModel == 'boolean') {
                    jsonModel = agm.decode(agm.COORD_DEFAULT);
	            }
	            angular.extend($scope, {
	                jsonModel: jsonModel,
	                main: {
	                    displayvalue: agm.setReadableCoordinates(jsonModel),
	                    ignoreEvents: false,
	                    setValue: function () {
	                        $scope.model.value = agm.encode($scope.jsonModel);
	                        $scope.main.displayvalue = agm.setReadableCoordinates($scope.jsonModel);
	                        $scope.main.forecolor = {};
	                        $scope.map.refresh();
	                    },
	                    forecolor: {},
	                    forecolorRed: { 'color': 'red' },
	                    place_changed: function (place) {
	                        $scope.jsonModel.searchtyped = place.formatted_address;
	                        $scope.map.control.getGMap().panTo(place.geometry.location);
	                        $scope.jsonModel.latitude = $scope.map.marker.latitude = place.geometry.location.lat();
	                        $scope.jsonModel.longitude = $scope.map.marker.longitude = place.geometry.location.lng();
	                        $scope.main.setValue();
	                        $scope.$apply();
	                        $scope.map.refresh();
	                    }
	                },
	                map: {
	                    show: true,
                        height: { 'height': '400px' },
                        control: {
	                        gMap: null,
                            setGMap: function (map) {
                                return $scope.map.control.gMap = map;
                            },
                            getGMap: function () {
                                return $scope.map.control.gMap;
                            }
	                    },
                        check: function () {
                            if (!$scope.map.control.getGMap().getBounds().contains($scope.map.marker.control.getGMarker().getPosition())) {
                                $scope.map.refresh();
                            }
                        },
                        refresh: function () {
                            $scope.main.ignoreEvents = true;
                            $scope.map.control.getGMap().setZoom($scope.jsonModel.zoom);
                            var latLng = {
	                            lat: $scope.jsonModel.latitude,
	                            lng: $scope.jsonModel.longitude
	                        };
	                        $scope.map.marker.control.getGMarker().setPosition(latLng);
	                        $scope.map.control.getGMap().panTo(latLng);
	                        google.maps.event.trigger($scope.map.control.getGMap(), 'resize');
	                        $scope.main.ignoreEvents = false;
                            ////$scope.$apply();
	                    },
	                    events: {
	                        zoom_changed: function () {
	                            if (!$scope.main.ignoreEvents) {
	                                $scope.jsonModel.zoom = $scope.map.control.getGMap().getZoom();
	                                $scope.main.setValue();
	                            }
	                        }
	                    },
	                    marker: {
	                        control: {
	                            gMarker: null,
	                            setGMarker: function (marker) {
	                                return $scope.map.marker.control.gMarker = marker;
	                            },
	                            getGMarker: function () {
	                                return $scope.map.marker.control.gMarker;
	                            }
	                        },
	                        events: {
	                            dragend: function (marker) {
	                                if (!$scope.main.ignoreEvents) {
	                                    $scope.jsonModel.latitude = marker.latLng.lat();
	                                    $scope.jsonModel.longitude = marker.latLng.lng();
	                                    $scope.main.setValue();
	                                }
	                            }
	                        }
	                    }
	                },
	                searchbox: {
	                    control: {
	                        gAutocomplete: null,
	                        setGAutocomplete: function (autocomplete) {
	                            return $scope.searchbox.control.gAutocomplete = autocomplete;
	                        },
	                        getGAutocomplete: function () {
	                            return $scope.searchbox.control.gAutocomplete;
	                        }
	                    },
	                    show: (agm.searchStatus == 'hide') ? false : true,
	                    options: {
	                        componentRestrictions: {
	                            country: agm.searchBoundaryCountry
	                        },
	                        autocomplete: (agm.searchStatus == 'autocomplete') ? true : false
	                    },
	                    events: {
	                        place_changed: function () {
	                            var place = $scope.searchbox.control.getGAutocomplete().getPlace();
	                            if (!place || typeof (place) === 'undefined') {
	                                return;
	                            }
	                            return $scope.main.place_changed(place);
	                        },
	                        places_changed: function () {
	                            var places = $scope.searchbox.control.getGAutocomplete().getPlaces()
	                            if (places.length == 0) {
	                                return;
	                            }
	                            return $scope.main.place_changed(places[0]);
	                        }
	                    }
	                },
	                checkCoordsTimer: null,
	                checkCoords: function () {
	                    jsonModel = agm.decode($scope.main.displayvalue);
	                    if (typeof jsonModel == 'boolean') {
	                        $scope.main.forecolor = $scope.main.forecolorRed;
	                    } else {
	                        $scope.main.forecolor = {};
	                        if (agm.mapStatus == true) {
	                            if ($scope.checkCoordsTimer != null) {
	                                clearTimeout($scope.checkCoordsTimer);
	                            }
	                            $scope.checkCoordsTimer = setTimeout(function () {
	                                $scope.checkCoordsTimer = null;
	                                $scope.jsonModel = jsonModel;
	                                $scope.main.setValue();
	                            }, agm.COORD_POLL);
	                        }
	                    }
	                },
	                init: function () {
	                    agm.eventMapLoadFailed.push(function () {
	                        if ($scope.map.control.getGMap() == null) {
	                            $scope.load(false);
	                        }
	                    });
	                    agm.eventMapLoadSuccess.push(function () {
	                        $scope.load(true);
	                    });
	                },
	                load: function () {
	                    //  Map
	                    $scope.map.control.setGMap(new google.maps.Map(document.getElementById('AGM_' + $scope.model.alias + '_map'), {
	                        disableDefaultUI: false,
	                        panControl: true,
	                        navigationControl: true,
	                        scrollwheel: false,
	                        scaleControl: true,
	                        center: {
	                            lat: $scope.jsonModel.latitude,
	                            lng: $scope.jsonModel.longitude
	                        },
	                        zoom: jsonModel.zoom,
	                        draggable: true
	                    }));
	                    google.maps.event.addListener($scope.map.control.getGMap(), 'zoom_changed', $scope.map.events.zoom_changed);
	                    google.maps.event.addListenerOnce($scope.map.control.getGMap(), 'tilesloaded', $scope.map.refresh);

                        //  Marker
	                    $scope.map.marker.control.setGMarker(new google.maps.Marker({
	                        map: $scope.map.control.getGMap(),
	                        position: {
	                            lat: $scope.jsonModel.latitude,
	                            lng: $scope.jsonModel.longitude
	                        },
	                        id: 'AGM_' + $scope.model.alias + '_marker',
	                        draggable: true,
	                        icon: agm.configIcon()
	                    }));
	                    google.maps.event.addListener($scope.map.marker.control.getGMarker(), 'dragend', $scope.map.marker.events.dragend);

                        //  Search
	                    $scope.searchbox.control.setGAutocomplete(new google.maps.places.Autocomplete(document.getElementById('AGM_' + $scope.model.alias + '_lookup')));

	                    google.maps.event.addListener($scope.searchbox.control.getGAutocomplete(), 'place_changed', $scope.searchbox.events.place_changed);
	                    google.maps.event.addListener($scope.searchbox.control.getGAutocomplete(), 'places_changed', $scope.searchbox.events.places_changed);
	                    setTimeout($scope.main.setValue, 1);

	                    //  Check to see if places service is enabled
	                    if (typeof (google.maps.places) === 'undefined') {
	                        agm.showPlacesServiceEnabled(false);
	                    } else {
	                        var service = new google.maps.places.PlacesService($scope.map.control.getGMap());
	                        service.textSearch({ query: agm.SEARCH_TEST }, function (results, status) {
                                agm.showPlacesServiceEnabled($scope.searchbox.show = (status == google.maps.places.PlacesServiceStatus.OK));
	                        });
	                    }
	                    var oldSize = 0;
	                    var timer = setInterval(function () {
	                        var element = document.getElementById('AGM_' + $scope.model.alias);
	                        if (element == null) {
	                            clearInterval(timer);
	                            return;
	                        }
	                        var newValue = element.offsetTop;
	                        var newSize = element.clientHeight * element.clientWidth;
	                        if (newValue != 0 && $scope.map.showMap == false) {
	                            //  Was hidden, now being shown
	                            //console.log($scope.model.alias + ' was hidden now showing');
	                            $scope.main.showLoading = false;
	                            $scope.map.showMap = true;
	                            $scope.$apply();
	                            setTimeout($scope.map.refresh, 1);
	                        } else if (newValue == 0 && $scope.map.showMap == true) {
	                            //  Was shown, now being hidden
	                            //console.log($scope.model.alias + ' was shown now hiding');
	                            $scope.main.showLoading = true;
	                            $scope.map.showMap = false;
	                            $scope.$apply();
	                        }
	                        else if ($scope.map.showMap == true && oldSize != 0 && newSize != 0 && oldSize != newSize) {
	                            setTimeout($scope.map.check, 1);
	                        }
	                        oldSize = newSize;
	                    }, agm.REFRESH_POLL);
	                }
	            });

	            agm.eventMapLoadSuccess.push(function () {
	                $scope.main.showMap = true;
	            });

	            agm.eventMapLoadFailed.push(function () {
	                //  Do nothing - allow the javascript error to be shown on screen
	            });
            }]);

            //  Content Controller
	        angular.module('umbraco').controller('agmView', ['$scope', function ($scope) {
	            var jsonModel = agm.decode($scope.model.value);
	            if (typeof jsonModel == 'boolean') {
	                jsonModel = agm.decode($scope.model.config.defaultLocation);
	                if (typeof jsonModel == 'boolean') {
	                    jsonModel = agm.decode(agm.COORD_DEFAULT);
	                }
	            }
	            angular.extend(jsonModel, {
	                icon: $scope.model.config.icon,
	                definition: $scope.model.config.definition,
	                format: $scope.model.config.format,
	            });
	            angular.extend($scope, {
	                preview: !angular.isUndefined($scope.model.sortOrder),
	                previewIconUrl: agm.configIconUrl($scope.model.config.icon.image),
	                jsonModel: jsonModel,
	                main: {
	                    displayvalue: agm.setReadableCoordinates(jsonModel),
	                    ignoreEvents: false,
	                    setValue: function () {
	                        $scope.model.value = agm.encode($scope.jsonModel);
	                        $scope.main.displayvalue = agm.setReadableCoordinates($scope.jsonModel);
	                        $scope.main.forecolor = {};
	                        if ($scope.map.show) {
	                            setTimeout($scope.map.refresh, 1);
	                        }
	                    },
	                    showLoading: true,
	                    showFailed: false,
	                    forecolor: {},
	                    forecolorRed: { 'color': 'red' },
	                    place_changed: function (place) {
	                        $scope.jsonModel.searchtyped = place.formatted_address;
	                        $scope.map.control.getGMap().panTo(place.geometry.location);
	                        $scope.jsonModel.latitude = $scope.map.marker.latitude = place.geometry.location.lat();
	                        $scope.jsonModel.longitude = $scope.map.marker.longitude = place.geometry.location.lng();
	                        $scope.main.setValue();
	                        $scope.$apply();
	                        setTimeout($scope.map.refresh, 1);
	                    },
	                    coordinatesBehavour_show: $scope.model.config.coordinatesBehavour != 0,
	                    coordinatesBehavour_readonly: $scope.model.config.coordinatesBehavour != 2,
	                },
	                map: {
	                    show: true,
	                    height: { 'height': $scope.model.config.height + 'px' },
	                    control: {
	                        gMap: null,
	                        setGMap: function (map) {
	                            return $scope.map.control.gMap = map;
	                        },
	                        getGMap: function () {
	                            return $scope.map.control.gMap;
	                        }
	                    },
	                    check: function () {
	                        if (!$scope.main.ignoreEvents && !$scope.map.control.getGMap().getBounds().contains($scope.map.marker.control.getGMarker().getPosition())) {
	                            setTimeout($scope.map.refresh, 1);
	                        }
	                    },
	                    refresh: function () {
	                        $scope.main.ignoreEvents = true;
	                        $scope.map.control.getGMap().setZoom($scope.jsonModel.zoom);
	                        var latLng = {
	                            lat: $scope.jsonModel.latitude,
	                            lng: $scope.jsonModel.longitude
	                        };
	                        $scope.map.marker.control.getGMarker().setPosition(latLng);
	                        $scope.map.control.getGMap().panTo(latLng);
	                        google.maps.event.trigger($scope.map.control.getGMap(), 'resize');
	                        setTimeout(function () {
	                            $scope.main.ignoreEvents = false;
	                        }, 1);
	                    },
	                    events: {
	                        zoom_changed: function () {
	                            if (!$scope.main.ignoreEvents) {
	                                var z = $scope.map.control.getGMap().getZoom();
	                                if ($scope.jsonModel.zoom != z) {
	                                    $scope.jsonModel.zoom = z;
	                                    $scope.main.setValue();
	                                }
	                            }
	                        }
	                    },
	                    marker: {
	                        control: {
	                            gMarker: null,
	                            setGMarker: function (marker) {
	                                return $scope.map.marker.control.gMarker = marker;
	                            },
	                            getGMarker: function () {
	                                return $scope.map.marker.control.gMarker;
	                            }
	                        },
	                        id: 'AGM_' + $scope.model.alias + '_marker',
	                        latitude: jsonModel.latitude,
	                        longitude: jsonModel.longitude,
	                        icon: agm.configIcon(null),
	                        options: {
	                            visible: true,
	                            draggable: true
	                        },
	                        events: {
	                            dragend: function (marker) {
	                                if (!$scope.main.ignoreEvents) {
	                                    $scope.jsonModel.latitude = marker.latLng.lat();
	                                    $scope.jsonModel.longitude = marker.latLng.lng();
	                                    $scope.main.setValue();
	                                }
	                            }
	                        }
	                    }
	                },
	                searchbox: {
	                    control: {
	                        gAutocomplete: null,
	                        setGAutocomplete: function (autocomplete) {
	                            return $scope.searchbox.control.gAutocomplete = autocomplete;
	                        },
	                        getGAutocomplete: function () {
	                            return $scope.searchbox.control.gAutocomplete;
	                        }
	                    },
	                    show: (agm.searchStatus == 'hide') ? false : true,
	                    options: {
	                        componentRestrictions: {
	                            country: $scope.model.config.definition.search.limit.country
	                        },
	                        autocomplete: ($scope.model.config.definition.search.status == 'autocomplete') ? true : false
	                    },
	                    events: {
	                        place_changed: function () {
	                            var place = $scope.searchbox.control.getGAutocomplete().getPlace();
	                            if (!place || typeof (place) === 'undefined') {
	                                return;
	                            }
	                            return $scope.main.place_changed(place);
	                        },
	                        places_changed: function () {
	                            var places = $scope.searchbox.control.getGAutocomplete().getPlaces()
	                            if (places.length == 0) {
	                                return;
	                            }
	                            return $scope.main.place_changed(places[0]);
	                        }
	                    }
	                },
	                checkCoordsTimer: null,
	                checkCoords: function () {
	                    jsonModel = agm.decode($scope.main.displayvalue);
	                    if (typeof jsonModel == 'boolean') {
	                        $scope.model.forecolor = $scope.main.forecolorRed;
	                    } else {
	                        $scope.model.forecolor = {};
	                        if (agm.mapStatus == true) {
	                            if ($scope.checkCoordsTimer != null) {
	                                clearTimeout($scope.checkCoordsTimer);
	                            }
	                            $scope.checkCoordsTimer = setTimeout(function () {
	                                $scope.checkCoordsTimer = null;
	                                $scope.jsonModel = jsonModel;
	                                $scope.main.setValue();
	                            }, agm.COORD_POLL);
	                        }
	                    }
	                },
	                eventMapLoadFailed: function () {
	                    $scope.main.showLoading = false;
	                    $scope.main.showFailed = true;
	                    $scope.map.showMap = false;
	                    $scope.main.coordinatesBehavour_show = true;
	                    $scope.main.coordinatesBehavour_readonly = false;
	                },
	                eventMapLoadSuccess: function () {
	                    var load = function (forceUpdate) {
	                        //console.log($scope.model.alias + ' was showing for first time');
	                        $scope.main.showLoading = false;
	                        $scope.main.showFailed = false;
	                        $scope.map.showMap = true;
	                        if (forceUpdate) {
	                            $scope.$apply();
	                        }
	                        setTimeout($scope.load, 1);
	                    };
	                    if ($scope.model.config.reduceWatches == '1') {
	                        var element = document.getElementById('AGM_' + $scope.model.alias);
	                        if (element == null) {
	                            return;
	                        }
	                        if (element.offsetTop != 0) {
	                            load(true);
	                        } else {
	                            var unregister = $scope.$watch(function () {
	                                var element = document.getElementById('AGM_' + $scope.model.alias);
	                                if (element == null) {
	                                    unregister();
	                                    return 0;
	                                }
	                                return element.offsetTop;
	                            }, function (newValue, oldValue) {
	                                if (newValue != 0) {
	                                    unregister();
	                                    load(false);
	                                }
	                            }, true);
	                        }
	                    } else {
	                        var timer = setInterval(function () {
	                            var element = document.getElementById('AGM_' + $scope.model.alias);
	                            if (element == null) {
	                                //  We don't seem to be running anymore
	                                clearInterval(timer);
	                            } else if (element.offsetTop != 0) {
	                                clearInterval(timer);
	                                load(true);
	                            }
	                        }, agm.REFRESH_POLL);
	                    }
	                },

	                init: function () {
	                    if ($scope.preview) {
	                        return;
	                    }
	                    $scope.model.hideLabel = $scope.model.config.hideLabel == 1;

	                    if (agm.mapStatus == null) {
	                        agm.eventMapLoadFailed.push($scope.eventMapLoadFailed);
	                        agm.eventMapLoadSuccess.push($scope.eventMapLoadSuccess);
	                        if (agm.gateController == 0) {
	                            agm.apiKey = $scope.model.config.definition.apiKey;
	                            agm.coordinateSystem = $scope.model.config.definition.coordinateSystem;
	                            agm.searchStatus = $scope.model.config.definition.search.status;
	                            agm.searchBoundaryCountry = $scope.model.config.definition.search.limit.country;
	                            setTimeout(agm.loadMap, 1);
	                        }
	                        agm.gateController++;
	                    } else if (agm.mapStatus == false) {
	                        $scope.eventMapLoadFailed();
	                    } else {
	                        var timer = setInterval(function () {
	                            var element = document.getElementById('AGM_' + $scope.model.alias);
	                            if (element != null) {
	                                clearInterval(timer);
	                                $scope.eventMapLoadSuccess();
	                            }
	                        }, agm.REFRESH_POLL);
	                    }
	                    if (agm.apiKey != $scope.model.config.definition.apiKey) {
	                        console.error('All AngularGoogleMaps have to be setup with the same Google API Key');
	                    }
	                },
	                load: function () {
	                    //  Map
	                    $scope.map.control.setGMap(new google.maps.Map(document.getElementById('AGM_' + $scope.model.alias + '_map'), {
	                        disableDefaultUI: false,
	                        panControl: true,
	                        navigationControl: true,
	                        scrollwheel: false,
	                        scaleControl: true,
	                        center: {
	                            lat: jsonModel.latitude,
	                            lng: jsonModel.longitude
	                        },
	                        zoom: $scope.jsonModel.zoom,
	                        draggable: true
	                    }));
	                    google.maps.event.addListener($scope.map.control.getGMap(), 'zoom_changed', $scope.map.events.zoom_changed);
	                    google.maps.event.addListenerOnce($scope.map.control.getGMap(), 'tilesloaded', $scope.map.refresh);
	                    google.maps.event.addListener($scope.map.control.getGMap(), "resize", $scope.map.check);
	                    //  Marker
	                    $scope.map.marker.control.setGMarker(new google.maps.Marker({
	                        map: $scope.map.control.getGMap(),
	                        position: {
	                            lat: $scope.map.marker.latitude,
	                            lng: $scope.map.marker.longitude
	                        },
	                        id: $scope.map.marker.id,
	                        draggable: $scope.map.marker.options.draggable,
	                        icon: agm.configIcon($scope.model.config)
	                    }));
	                    google.maps.event.addListener($scope.map.marker.control.getGMarker(), 'dragend', $scope.map.marker.events.dragend);

	                    //  Search
	                    var options = {
	                        autocomplete: $scope.searchbox.options.autocomplete
	                    };
	                    if ($scope.searchbox.options.componentRestrictions.country != '') {
	                        //options.types = ['(cities)'];
	                        options.componentRestrictions = [];
	                        options.componentRestrictions.country = $scope.searchbox.options.componentRestrictions.country;
	                    }
	                    $scope.searchbox.control.setGAutocomplete(new google.maps.places.Autocomplete(document.getElementById('AGM_' + $scope.model.alias + '_lookup'), options));
	                    google.maps.event.addListener($scope.searchbox.control.getGAutocomplete(), 'place_changed', $scope.searchbox.events.place_changed);
	                    google.maps.event.addListener($scope.searchbox.control.getGAutocomplete(), 'places_changed', $scope.searchbox.events.places_changed);

                        //  Set events for when map appears and disappears
	                    if ($scope.model.config.reduceWatches == '1') {
	                        //  Timer via Watches
	                        $scope.$watch(function () {
	                            return document.getElementById('AGM_' + $scope.model.alias).offsetTop;
	                        }, function (newValue, oldValue) {
	                            if (newValue != 0 && $scope.map.showMap == false) {
	                                //  Was hidden, now being shown
	                                //console.log($scope.model.alias + ' was hidden now showing');
	                                $scope.main.showLoading = false;
	                                $scope.map.showMap = true;
	                                setTimeout($scope.map.refresh, 1);
	                            } else if (newValue == 0 && $scope.map.showMap == true) {
	                                //  Was shown, now being hidden
	                                //console.log($scope.model.alias + ' was shown now hiding');
	                                $scope.main.showLoading = true;
	                                $scope.map.showMap = false;
                                }
	                        }, true);
	                        $scope.$watch(function () {
	                            var element = document.getElementById('AGM_' + $scope.model.alias);
	                            return element.clientHeight * element.clientWidth;
	                        }, function (newValue, oldValue) {
	                            if (newValue != oldValue) {
	                                setTimeout($scope.map.check, 1);
	                            }
	                        }, true);
	                    } else {
	                        //    Hardcore timer
	                        var oldSize = 0;
	                        var timer = setInterval(function () {
	                            var element = document.getElementById('AGM_' + $scope.model.alias);
	                            if (element == null) {
	                                clearInterval(timer);
	                                return;
	                            }
	                            var newValue = element.offsetTop;
	                            var newSize = element.clientHeight * element.clientWidth;
	                            if (newValue != 0 && $scope.map.showMap == false) {
	                                //  Was hidden, now being shown
	                                //console.log($scope.model.alias + ' was hidden now showing');
	                                $scope.main.showLoading = false;
	                                $scope.map.showMap = true;
	                                $scope.$apply();
	                                setTimeout($scope.map.refresh, 1);
                                } else if (newValue == 0 && $scope.map.showMap == true) {
	                                //  Was shown, now being hidden
	                                //console.log($scope.model.alias + ' was shown now hiding');
	                                $scope.main.showLoading = true;
	                                $scope.map.showMap = false;
	                                $scope.$apply();
                                }
                                else if ($scope.map.showMap == true && oldSize != 0 && newSize != 0 && oldSize != newSize) {
	                                setTimeout($scope.map.check, 1);
	                            }
	                            oldSize = newSize;
	                        }, agm.REFRESH_POLL);
	                    }

	                    var height = parseInt($scope.model.config.height);
	                    if (isNaN(height) || height < 1 || height > 9999) {
	                        height = 400;
	                    }
	                    $scope.map.height = { 'height': height.toString() + 'px' };
	                    setTimeout($scope.main.setValue, 1);
	                }
	            });

	        }]);
	    },
	    decodeJson: function (value) {
	        return JSON.parse(value);
	    },
	    decodeCsv: function (value) {
	        try {
	            var args = value.trim().split(',');
	            if (args.length < 2) {
	                return false;
	            }
	            var lat = parseFloat(args[0]);
	            if (isNaN(lat) || lat > 90 || lat < -90) {
	                return false;
	            }
	            var lng = parseFloat(args[1]);
	            if (isNaN(lng) || lng > 180 || lng < -180) {
	                return false;
	            }

	            var zoom = (args.length > 2) ? parseInt(args[2]) : agm.DEFAULT_ZOOM;
	            if (isNaN(zoom) || zoom < 1 || zoom > 20) {
	                zoom = agm.DEFAULT_ZOOM;
	            }

	            return {
	                "latitude": lat,
	                "longitude": lng,
	                "zoom": zoom,
	                "icon": {
	                    "image": (args.length > 3) ? args[3] : "",
	                    "shadowImage": (args.length > 4) ? args[4] : "",
	                    "size": {
	                        "width": (args.length > 5) ? parseInt(args[5]) : 0,
	                        "height": (args.length > 6) ? parseInt(args[6]) : 0,
	                    },
	                    "anchor": {
	                        "horizontal": (args.length > 7) ? args[7] : "",
	                        "vertical": (args.length > 8) ? args[8] : ""
	                    }
	                },
	                "format": (args.length > 9) ? args[9] : "",
	                "definition": {
	                    "apikey": (args.length > 10) ? args[10] : "",
	                    "coordinatesystem": (args.length > 11) ? args[11] : "",
	                    "search": {
	                        "status": (args.length > 12) ? args[12] : "",
	                        "limit" : {
	                            "country": (args.length > 13) ? args[13] : ""
	                        }
	                    }
	                },
	                "searchtyped": (args.length > 14) ? unescape(args[14]) : ""
	            };
	        }
	        catch (oh) {
	            return false;		//	wasn't a number
	        }
	    },
	    decodeXml: function (value) {
	        return {
	            "latitude": $(value).find("latitude").text(),
	            "longitude": $(value).find("longitude").text(),
	            "zoom": $(value).find("zoom").text()
	        };
	    },
	    decode: function (value) {
	        if (typeof (value) == 'object') {
	            return value;
	        }
	        if (typeof (value) != 'string') {
	            return false;
	        }
	        switch (value.substring(0, 1)) {
	            case '{':
	                return agm.decodeJson(value);
	            
	            case '<':
	                return agm.decodeXml(value);
                
	            default:
	                return agm.decodeCsv(value);
	        }
	    },
	    encodeJson: function (value) {
	        return JSON.stringify(value);
	    },
	    encodeLatLng: function (latlng) {
	        return Number(latlng).toFixed(agm.COORD_DECIMAL_PLACES).replace(/\.?0+$/, '');
	    },
	    encodeXml: function (value) {
	        return "<angulargooglemap><latitude>" + agm.encodeLatLng(value.latitude) + "</latitude><longitude>" + agm.encodeLatLng(value.longitude) + "</longitude><zoom>" + value.zoom + "</zoom></angulargooglemap>";
	    },
	    encodeCsv: function (value, allArgs) {
	        var text = agm.encodeLatLng(value.latitude) + ',' + agm.encodeLatLng(value.longitude) + ',' + value.zoom;
	        if (!allArgs) {
	            return text;
	        }
	        return text + ',' + value.icon.image + ',' + value.icon.shadowImage + ',' + value.icon.size.width + ',' + value.icon.size.height + ',' + value.icon.anchor.horizontal +
                ',' + value.icon.anchor.vertical + ',' + value.format + ',' + value.definition.apiKey + ',' + value.definition.coordinateSystem +
                ',' + value.definition.search.status + ',' + value.definition.search.limit.country + ',' + escape(value.searchtyped);
	    },
	    encode: function (value) {
	        if (typeof value.format === 'undefined' || value == null || value.format == null || typeof value.format != 'string') {
	            value = {
	                "format": "csv"
	            };
	        }
	        switch (value.format.toLowerCase()) {
	            case 'json':
                case '1':
	                return agm.encodeJson(value);

	            case 'xml':
                case '2':
	                return agm.encodeXml(value);

	            case 'csv':
                case '0':
	                return agm.encodeCsv(value, false);

	            default:
	                return agm.encodeCsv(value, true);
	        }
	    },
	    getAnchorHorizontal: function (text, width) {
	        if (typeof text == 'string') {
	            switch (text.charAt(0)) {
	                case 'l':
	                case 'L':
	                    return 0;

	                case 'c':
	                case 'C':
	                case 'm':
	                case 'M':
	                    return width / 2;

	                case 'r':
	                case 'R':
	                    return width - 1;
	            }
	        }
	        return Number(text);
	    },
	    getAnchorVertical: function (text, height) {
	        if (typeof text == 'string') {
	            switch (text.charAt(0)) {
	                case 't':
	                case 'T':
	                    return 0;

	                case 'c':
	                case 'C':
	                case 'm':
	                case 'M':
	                    return height / 2;

	                case 'b':
	                case 'B':
	                    return height - 1;
	            }
	        }
	        return Number(text);
	    },
	    predefinedIconUrl: function (name) {
	        switch (name.trim().toLowerCase()) {
	            case '':
	            case 'red marker':
	            case 'marker':
	                return 'https://mt.google.com/vt/icon/name=icons/spotlight/spotlight-poi.png';

	            case 'green marker':
	                return 'https://mt.google.com/vt/icon?psize=30&font=fonts/arialuni_t.ttf&color=ff304C13&name=icons/spotlight/spotlight-waypoint-a.png&ax=43&ay=48&text=%E2%80%A2';

	            case 'blue marker':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/spotlight-waypoint-blue.png';

                case 'purple marker':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/spotlight-ad.png';

	            case 'gold star':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/star_L_8x.png&scale=2';

	            case 'grey home':
	            case 'gray home':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/home_L_8x.png&scale=2';

	            case 'red shopping cart':
	            case 'red cart':
	            case 'shopping cart':
	            case 'cart':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/supermarket_search_L_8x.png&scale=2';

	            case 'blue shopping cart':
	            case 'blue cart':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/supermarket_L_8x.png&scale=2';

	            case 'red hot spring':
	            case 'red spring':
	            case 'hot spring':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/jp/hot_spring_search_L_8x.png&scale=2';

	            case 'green hot spring':
	            case 'green spring':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/jp/hot_spring_L_8x.png&scale=2';

	            case 'red dharma':
	            case 'dharma':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/worship_dharma_search_L_8x.png&scale=2';

	            case 'brown dharma':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/worship_dharma_L_8x.png&scale=2';

	            case 'red jain':
	            case 'jain':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/worship_jain_search_L_8x.png&scale=2';

	            case 'brown jain':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/worship_jain_L_8x.png&scale=2';

	            case 'red shopping':
	            case 'shopping':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/shopping_search_L_8x.png&scale=2';

	            case 'blue shopping':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/shopping_L_8x.png&scale=2';

	            case 'red harbour':
	            case 'harbour':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/harbour_search_L_8x.png&scale=2';

	            case 'blue harbour':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/harbour_L_8x.png&scale=2';

	            case 'red parking':
	            case 'parking':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/parking_search_L_8x.png&scale=2';

	            case 'brown parking':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/parking_L_8x.png&scale=2';

	            case 'red shrine':
	            case 'shrine':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/jp/shrine_search_L_8x.png&scale=2';

	            case 'brown shrine':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/jp/shrine_L_8x.png&scale=2';

	            case 'red museum japan':
	            case 'museum japan':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/jp/museum_japan_search_L_8x.png&scale=2';

	            case 'brown museum japan':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/jp/museum_japan_L_8x.png&scale=2';

	            case 'red gas station':
	            case 'red petrol station':
	            case 'red gas pump':
	            case 'red petrol pump':
	            case 'gas station':
	            case 'petrol station':
	            case 'gas pump':
	            case 'petrol pump':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/gas_station_search_L_8x.png&scale=2';

	            case 'blue gas station':
	            case 'blue petrol station':
	            case 'blue gas pump':
	            case 'blue petrol pump':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/gas_station_L_8x.png&scale=2';

	            case 'red plane':
	            case 'plane':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/airport_search_L_8x.png&scale=2';

	            case 'blue plane':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/airport_L_8x.png&scale=2';

	            case 'red museum':
	            case 'museum':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/museum_search_L_8x.png&scale=2';

	            case 'brown museum':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/museum_L_8x.png&scale=2';

	            case 'red bullseye':
	            case 'bullseye':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/jp/city_office_search_L_8x.png&scale=2';

	            case 'brown bullseye':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/jp/city_office_L_8x.png&scale=2';

	            case 'red movie':
	            case 'movie':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/movie_search_L_8x.png&scale=2';

	            case 'blue movie':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/movie_L_8x.png&scale=2';

	            case 'red restaurant':
	            case 'restaurant':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/restaurant_search_L_8x.png&scale=2';

	            case 'orange restaurant':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/restaurant_L_8x.png&scale=2';

	            case 'red monument':
	            case 'monument':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/monument_search_L_8x.png&scale=2';

	            case 'brown monument':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/monument_L_8x.png&scale=2';

	            case 'red police japan':
	            case 'police japan':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/jp/police_japan_search_L_8x.png&scale=2';

	            case 'brown police japan':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/jp/police_japan_L_8x.png&scale=2';

	            case 'red post office':
	            case 'post office':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/post_office_search_L_8x.png&scale=2';

	            case 'blue post office':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/post_office_L_8x.png&scale=2';

	            case 'red cafe':
	            case 'cafe':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/cafe_search_L_8x.png&scale=2';

	            case 'orange cafe':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/cafe_L_8x.png&scale=2';

	            case 'red library':
	            case 'library':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/library_search_L_8x.png&scale=2';

	            case 'brown library':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/library_L_8x.png&scale=2';

	            case 'red star':
	            case 'star':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/cn/government_china_search_L_8x.png&scale=2';

	            case 'brown star':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/cn/government_china_L_8x.png&scale=2';

	            case 'red drink':
	            case 'drink':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/bar_search_L_8x.png&scale=2';

	            case 'orange drink':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/bar_L_8x.png&scale=2';

	            case 'red police search':
	            case 'police search':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/police_search_L_8x.png&scale=2';

	            case 'brown police search':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/police_L_8x.png&scale=2';

	            case 'red fire japan':
	            case 'fire japan':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/jp/fire_japan_search_L_8x.png&scale=2';

	            case 'brown fire japan':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/jp/fire_japan_L_8x.png&scale=2';

	            case 'red ancient_relic':
	            case 'ancient_relic':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/jp/ancient_relic_search_L_8x.png&scale=2';

	            case 'brown ancient_relic':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/jp/ancient_relic_L_8x.png&scale=2';

	            case 'red tree':
	            case 'tree':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/park_search_L_8x.png&scale=2';

	            case 'green tree':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/park_L_8x.png&scale=2';

	            case 'red toilets':
	            case 'toilets':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/wc_search_L_8x.png&scale=2';

	            case 'brown toilets':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/wc_L_8x.png&scale=2';

	            case 'red hospital':
	            case 'hospital':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/hospital_H_search_L_8x.png&scale=2';

	            case 'red dollar':
	            case 'dollar':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/bank_dollar_search_L_8x.png&scale=2';

	            case 'blue dollar':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/bank_dollar_L_8x.png&scale=2';

	            case 'red golf':
	            case 'golf':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/golf_search_L_8x.png&scale=2';

	            case 'green golf':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/golf_L_8x.png&scale=2';

	            case 'red civic building':
	            case 'civic building':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/golf_search_L_8x.png&scale=2';

	            case 'brown civic building':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/golf_L_8x.png&scale=2';

	            case 'red historic China':
	            case 'historic China':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/cn/historic_china_search_L_8x.png&scale=2';

	            case 'brown historic China':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/cn/historic_china_L_8x.png&scale=2';

	            case 'red euro':
	            case 'euro':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/bank_euro_search_L_8x.png&scale=2';

	            case 'blue euro':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/bank_euro_L_8x.png&scale=2';

	            case 'red cemetery':
	            case 'cemetery':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/cemetery_search_L_8x.png&scale=2';

	            case 'green cemetery':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/cemetery_L_8x.png&scale=2';

	            case 'red lodging':
	            case 'lodging':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/lodging_search_L_8x.png&scale=2';

	            case 'brown lodging':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/lodging_L_8x.png&scale=2';

	            case 'red post office japan':
	            case 'post office japan':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/jp/post_office_japan_search_L_8x.png&scale=2';

	            case 'brown post office japan':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/jp/post_office_japan_L_8x.png&scale=2';

	            case 'red pound':
	            case 'pound':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/bank_pound_search_L_8x.png&scale=2';

	            case 'blue pound':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/bank_pound_L_8x.png&scale=2';

	            case 'red mountains':
	            case 'mountains':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/mountains_search_L_8x.png&scale=2';

	            case 'green mountains':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/mountains_L_8x.png&scale=2';

	            case 'red unversity':
	            case 'unversity':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/university_search_L_8x.png&scale=2';

	            case 'brown unversity':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/university_L_8x.png&scale=2';

	            case 'red tent':
	            case 'tent':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/mountains_search_L_8x.png&scale=2';

	            case 'green tent':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/mountains_L_8x.png&scale=2';

	            case 'red temple':
	            case 'temple':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/temple_search_L_8x.png&scale=2';

	            case 'brown temple':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/temple_L_8x.png&scale=2';

	            case 'red circle':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/generic_search_L_8x.png&scale=2';

	            case 'orange circle':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/ad_L_8x.png&scale=2';

	            case 'brown circle':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/generic_establishment_v_L_8x.png&scale=2';

	            case 'green circle':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/generic_recreation_v_L_8x.png&scale=2';

	            case 'blue circle':
                    return 'https://mt.google.com/vt/icon/name=icons/spotlight/generic_retail_v_L_8x.png&scale=2';

	            case 'orange roadworks':
                    return 'https://mt.google.com/vt/icon/name=icons/layers/traffic/construction_large_8x.png&scale=2';

	            case 'orange umbraco':
                    return '~/Umbraco/assets/img/application/logo.png';

	            case 'black umbraco':
                    return '~/Umbraco/assets/img/application/logo_black.png';

	            case 'white umbraco':
                    return '~/Umbraco/assets/img/application/logo_white.png';

	            default:
                    return name;
            }
	    },
	    configIconUrl: function (url) {
	        if (typeof (url) === 'undefined' || url == null) {
	            return '';
	        }
	        if (url.indexOf('//') != -1) {
	            //  Is an absolute address
	            return url;
	        }
            //  Must be a relative address
	        if (url.substring(0, 1) != '/') {
	            url = '/' + url;
	        }

	        return root.location.protocol + '//' + root.location.hostname + (root.location.port ? ':' + root.location.port : '') + url;
	    },
	    configIcon: function (config) {
	        if (typeof config === 'undefined' || config == null || typeof config.icon === 'undefined' || config.icon == null ||
                typeof config.icon.image === 'undefined' || config.icon.image == null || String(config.icon.image).trim() == '') {
	            return {url: 'https://mt.google.com/vt/icon/name=icons/spotlight/spotlight-poi.png'};
	        } else {
	            if (typeof config.iconUrl !== 'undefined') {
	                return { url: agm.configIconUrl(agm.predefinedIconUrl(config.iconUrl)) };
	            } else {
	                return {
	                    url: agm.configIconUrl(config.icon.image),
	                    scaledSize: new google.maps.Size(config.icon.size.width, config.icon.size.height),
	                    anchor: new google.maps.Point(agm.getAnchorHorizontal(config.icon.anchor.horizontal, config.icon.size.width),
                            agm.getAnchorVertical(config.icon.anchor.vertical, config.icon.size.height)),
	                    shadow: config.icon.shadowImage        /* This has been deprecated */
	                }
	            }
	        }
	    },
	    setReadableCoordinates: function (jsonModel) {
	        return agm.encodeLatLng(jsonModel.latitude) + ',' + agm.encodeLatLng(jsonModel.longitude) + ',' + jsonModel.zoom
	    }
	}
    agm.init();

}(window));
