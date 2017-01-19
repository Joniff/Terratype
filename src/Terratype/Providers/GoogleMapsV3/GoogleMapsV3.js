(function (root) {

    //  Subsystem that loads or destroys Google Map library
    var terratypeGoogleMapV3 = {
        originalConsole: root.console,
        domain: null,
        registeredEvents: [],
        subsystemUninitiated: 0,
        subsystemInit: 1,
        subsystemReadGoogleJs: 2,
        subsystemCheckGoogleJs: 3,
        subsystemLoadedGoogleJs: 4,
        subsystemCooloff: 5,
        subsystemCompleted: 6,
        status: 0,
        killswitch: false,
        poll: 250,
        timeout: 15000,
        fakeConsole: {
            isFake: true,
            error: function (a) {
                if ((a.indexOf('Google Maps API') != -1 || a.indexOf('Google Maps Javascript API') != -1) &&
                    (a.indexOf('MissingKeyMapError') != -1 || a.indexOf('ApiNotActivatedMapError') != -1 ||
                    a.indexOf('InvalidKeyMapError') != -1 || a.indexOf('not authorized') != -1 || a.indexOf('RefererNotAllowedMapError') != -1)) {
                    destroySubsystem();
                    raiseEvent('gmaperror');
                }
                try {
                    originalConsole.error(a);
                }
                catch (oh) {
                }
            },
            warn: function (a) {
                try {
                    originalConsole.warn(a);
                }
                catch (oh) {
                }
            },
            log: function (a) {
                try {
                    originalConsole.log(a);
                }
                catch (oh) {
                }
            }
        },
        installFakeConsole: function () {
            if (typeof (root.console.isFake) === 'undefined') {
                root.console = fakeConsole;
            }
        },
        uninstallFakeConsole: function () {
            root.console = originalConsole;
        },
        isGoogleMapsLoaded: function () {
            return angular.isDefined(root.google) && angular.isDefined(root.google.maps);
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
        indexEventHandler: function (scope) {
            return registeredEvents.map(function (x) { return x.id; }).indexOf(scope.id);
        },
        registerEventHandler: function (scope) {
            if (indexEventHandler(scope) == -1) {
                registeredEvents.push(scope);
                return true;
            }
            return false;
        },
        cancelEventHandler: function (scope) {
            var index = indexEventHandler(scope);
            if (index == -1) {
                return false;       //  Unable to find this event handler
            }
            registeredEvents.splice(index, 1);
            if (registeredEvents.length == 0) {
                //  Nobody left talking to us, so kill
                terratypeGoogleMapV3.destroySubsystem();
            }
            return true;
        },
        raiseEvent: function (name) {
            angular.forEach (registeredEvents, function (event, index) {
                event.$broadcast(name);
            });
        },
        destroySubsystem: function () {
            uninstallFakeConsole();
            delete google;
            if (domain) {
                uninstallScript(domain);
                domain = null;
            }
            status = subsystemUninitiated;
            killswitch = false;
        },
        ticks: function () {
            return (new Date().getTime());
        },
        createSubsystem: function (apiKey, forceHttps, coordinateSystem, language) {
            root.TerratypeGoogleMapsV3Callback = function  () {
                status = subsystemCheckGoogleJs;
            }
            var start = ticks() + timeout;
            var wait = setInterval(function  () {
                if (ticks() > start) {
                    destroySubsystem();
                    raiseEvent('gmapkilled');
                } else if (status == subsystemCompleted || status == subsystemUninitiated || status == subsystemInit) {
                    clearInterval(wait);
                    var https = '';
                    if (forceHttps) {
                        https = 'https:';
                    }
                    domain = https + ((coordinateSystem == 'GCJ02') ? '//maps.google.cn/' : '//maps.googleapis.com/');
                    status = subsystemInit;
                    killswitch = false;
                    var key = '';
                    if (apiKey) {
                        key = '&key=' + apiKey;
                    }

                    var lan = '';
                    if (language) {
                        lan = '&language' + language;
                    }

                    start = ticks() + timeout;
                    var timer = setInterval(function () {
                        if (killswitch) {
                            destroySubsystem();
                            raiseEvent('gmapkilled');
                            clearInterval(timer);
                        } else if (ticks() > start) {
                            if (status == subsystemCooloff) {
                                status = subsystemCompleted;
                                uninstallFakeConsole();
                            } else {
                                destroySubsystem();
                                raiseEvent('gmaperror');
                            }
                            clearInterval(timer);
                        } else {
                            switch (status)
                            {
                                case subsystemInit:
                                    LazyLoad.js(attempt.domain + '/maps/api/js?v=3&sensor=true&libraries=places&callback=TerratypeGoogleMapsV3Callback' + key + lan, function () {
                                        status = subsystemReadGoogleJs;
                                    });
                                    break;

                                case subsystemCheckGoogleJs:
                                    if (isGoogleMapsLoaded()) {
                                        status = subsystemLoadedGoogleJs;
                                        raiseEvent('gmaploaded');
                                    }
                                    break;

                                case subsystemLoadedGoogleJs:
                                    status = subsystemCooloff;
                                    start = ticks() + timeout;
                                    break;
                            }
                        }
                    }, poll);
                } else {
                    killswitch = true;
                }
            }, poll)
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
        icon: function (config) {
            if (!angular.isDefined(config) || config == null || 
                !angular.isDefined(config.icon) || config.icon == null ||
                !angular.isDefined(config.icon.image) || config.icon.image == null || 
                String(config.icon.image).trim() == '') {
                return {url: 'https://mt.google.com/vt/icon/name=icons/spotlight/spotlight-poi.png'};
            } else {
                return {
                    url: configIconUrl(config.icon.image),
                    scaledSize: new google.maps.Size(config.icon.size.width, config.icon.size.height),
                    anchor: new google.maps.Point(getAnchorHorizontal(config.icon.anchor.horizontal, config.icon.size.width),
                        getAnchorVertical(config.icon.anchor.vertical, config.icon.size.height)),
                    shadow: config.icon.shadowImage        /* This has been deprecated */
                }
            }
        },
        style: function (color, showRoads, showLandmarks, showLabels) {
            var styles = [];
            
            switch (color)
            {
                case 1:             //  Silver
                    styles = [
                        { 'elementType': 'geometry', 'stylers': [{ 'color': '#f5f5f5' } ] },
                        { 'elementType': 'labels.icon', 'stylers': [ { 'visibility': 'off' } ] }, 
                        { 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#616161' } ] }, 
                        { 'elementType': 'labels.text.stroke', 'stylers': [ { 'color': '#f5f5f5' } ] }, 
                        { 'featureType': 'administrative.land_parcel', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#bdbdbd' } ] }, 
                        { 'featureType': 'poi', 'elementType': 'geometry', 'stylers': [ { 'color': '#eeeeee' } ] }, 
                        { 'featureType': 'poi', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#757575' } ] }, 
                        { 'featureType': 'poi.park', 'elementType': 'geometry', 'stylers': [ { 'color': '#e5e5e5' } ] }, 
                        { 'featureType': 'poi.park', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#9e9e9e' } ] }, 
                        { 'featureType': 'road', 'elementType': 'geometry', 'stylers': [ { 'color': '#ffffff' } ] }, 
                        { 'featureType': 'road.arterial', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#757575' } ] }, 
                        { 'featureType': 'road.highway', 'elementType': 'geometry', 'stylers': [ { 'color': '#dadada' } ] }, 
                        { 'featureType': 'road.highway', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#616161' } ] }, 
                        { 'featureType': 'road.local', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#9e9e9e' } ] }, 
                        { 'featureType': 'transit.line', 'elementType': 'geometry', 'stylers': [ { 'color': '#e5e5e5' } ] }, 
                        { 'featureType': 'transit.station', 'elementType': 'geometry', 'stylers': [ { 'color': '#eeeeee' } ] }, 
                        { 'featureType': 'water', 'elementType': 'geometry', 'stylers': [ { 'color': '#c9c9c9' } ] }, 
                        { 'featureType': 'water', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#9e9e9e' } ] }
                    ];
                    break;

                case 2:             //  Retro
                    styles = [ 
                        { 'elementType': 'geometry', 'stylers': [ { 'color': '#ebe3cd' } ] }, 
                        { 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#523735' } ] }, 
                        { 'elementType': 'labels.text.stroke', 'stylers': [ { 'color': '#f5f1e6' } ] }, 
                        { 'featureType': 'administrative', 'elementType': 'geometry.stroke', 'stylers': [ { 'color': '#c9b2a6' } ] }, 
                        { 'featureType': 'administrative.land_parcel', 'elementType': 'geometry.stroke', 'stylers': [ { 'color': '#dcd2be' } ] }, 
                        { 'featureType': 'administrative.land_parcel', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#ae9e90' } ] }, 
                        { 'featureType': 'landscape.natural', 'elementType': 'geometry', 'stylers': [ { 'color': '#dfd2ae' } ] }, 
                        { 'featureType': 'poi', 'elementType': 'geometry', 'stylers': [ { 'color': '#dfd2ae' } ] }, 
                        { 'featureType': 'poi', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#93817c' } ] }, 
                        { 'featureType': 'poi.park', 'elementType': 'geometry.fill', 'stylers': [ { 'color': '#a5b076' } ] }, 
                        { 'featureType': 'poi.park', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#447530' } ] }, 
                        { 'featureType': 'road', 'elementType': 'geometry', 'stylers': [ { 'color': '#f5f1e6' } ] }, 
                        { 'featureType': 'road.arterial', 'elementType': 'geometry', 'stylers': [ { 'color': '#fdfcf8' } ] }, 
                        { 'featureType': 'road.highway', 'elementType': 'geometry', 'stylers': [ { 'color': '#f8c967' } ] }, 
                        { 'featureType': 'road.highway', 'elementType': 'geometry.stroke', 'stylers': [ { 'color': '#e9bc62' } ] }, 
                        { 'featureType': 'road.highway.controlled_access', 'elementType': 'geometry', 'stylers': [ { 'color': '#e98d58' } ] }, 
                        { 'featureType': 'road.highway.controlled_access', 'elementType': 'geometry.stroke', 'stylers': [ { 'color': '#db8555' } ] }, 
                        { 'featureType': 'road.local', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#806b63' } ] }, 
                        { 'featureType': 'transit.line', 'elementType': 'geometry', 'stylers': [ { 'color': '#dfd2ae' } ] }, 
                        { 'featureType': 'transit.line', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#8f7d77' } ] }, 
                        { 'featureType': 'transit.line', 'elementType': 'labels.text.stroke', 'stylers': [ { 'color': '#ebe3cd' } ] }, 
                        { 'featureType': 'transit.station', 'elementType': 'geometry', 'stylers': [ { 'color': '#dfd2ae' } ] }, 
                        { 'featureType': 'water', 'elementType': 'geometry.fill', 'stylers': [ { 'color': '#b9d3c2' } ] }, 
                        { 'featureType': 'water', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#92998d' } ] } 
                    ];
                    break;

                case 3:             //  Dark
                    styles = [
                        { 'elementType': 'geometry', 'stylers': [ { 'color': '#212121' } ] }, 
                        { 'elementType': 'labels.icon', 'stylers': [ { 'visibility': 'off' } ] }, 
                        { 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#757575' } ] }, 
                        { 'elementType': 'labels.text.stroke', 'stylers': [ { 'color': '#212121' } ] }, 
                        { 'featureType': 'administrative', 'elementType': 'geometry', 'stylers': [ { 'color': '#757575' } ] }, 
                        { 'featureType': 'administrative.country', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#9e9e9e' } ] }, 
                        { 'featureType': 'administrative.land_parcel', 'stylers': [ { 'visibility': 'off' } ] }, 
                        { 'featureType': 'administrative.locality', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#bdbdbd' } ] }, 
                        { 'featureType': 'poi', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#757575' } ] }, 
                        { 'featureType': 'poi.park', 'elementType': 'geometry', 'stylers': [ { 'color': '#181818' } ] }, 
                        { 'featureType': 'poi.park', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#616161' } ] }, 
                        { 'featureType': 'poi.park', 'elementType': 'labels.text.stroke', 'stylers': [ { 'color': '#1b1b1b' } ] }, 
                        { 'featureType': 'road', 'elementType': 'geometry.fill', 'stylers': [ { 'color': '#2c2c2c' } ] }, 
                        { 'featureType': 'road', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#8a8a8a' } ] }, 
                        { 'featureType': 'road.arterial', 'elementType': 'geometry', 'stylers': [ { 'color': '#373737' } ] }, 
                        { 'featureType': 'road.highway', 'elementType': 'geometry', 'stylers': [ { 'color': '#3c3c3c' } ] }, 
                        { 'featureType': 'road.highway.controlled_access', 'elementType': 'geometry', 'stylers': [ { 'color': '#4e4e4e' } ] }, 
                        { 'featureType': 'road.local', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#616161' } ] }, 
                        { 'featureType': 'transit', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#757575' } ] }, 
                        { 'featureType': 'water', 'elementType': 'geometry', 'stylers': [ { 'color': '#000000' } ] }, 
                        { 'featureType': 'water', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#3d3d3d' } ] }
                    ];
                    break;

                case 4:             //  Night
                    styles = [
                        { 'elementType': 'geometry', 'stylers': [ { 'color': '#242f3e' } ] }, 
                        { 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#746855' } ] }, 
                        { 'elementType': 'labels.text.stroke', 'stylers': [ { 'color': '#242f3e' } ] }, 
                        { 'featureType': 'administrative.locality', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#d59563' } ] }, 
                        { 'featureType': 'poi', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#d59563' } ] }, 
                        { 'featureType': 'poi.park', 'elementType': 'geometry', 'stylers': [ { 'color': '#263c3f' } ] }, 
                        { 'featureType': 'poi.park', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#6b9a76' } ] }, 
                        { 'featureType': 'road', 'elementType': 'geometry', 'stylers': [ { 'color': '#38414e' } ] }, 
                        { 'featureType': 'road', 'elementType': 'geometry.stroke', 'stylers': [ { 'color': '#212a37' } ] }, 
                        { 'featureType': 'road', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#9ca5b3' } ] }, 
                        { 'featureType': 'road.highway', 'elementType': 'geometry', 'stylers': [ { 'color': '#746855' } ] }, 
                        { 'featureType': 'road.highway', 'elementType': 'geometry.stroke', 'stylers': [ { 'color': '#1f2835' } ] }, 
                        { 'featureType': 'road.highway', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#f3d19c' } ] }, 
                        { 'featureType': 'transit', 'elementType': 'geometry', 'stylers': [ { 'color': '#2f3948' } ] }, 
                        { 'featureType': 'transit.station', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#d59563' } ] }, 
                        { 'featureType': 'water', 'elementType': 'geometry', 'stylers': [ { 'color': '#17263c' } ] }, 
                        { 'featureType': 'water', 'elementType': 'labels.text.fill', 'stylers': [ { 'color': '#515c6d' } ] }, 
                        { 'featureType': 'water', 'elementType': 'labels.text.stroke', 'stylers': [ { 'color': '#17263c' } ] }
                    ];
                    break;

                case 5:             //  Desert
                    styles = [
                        {'featureType':'administrative','elementType':'all','stylers':[{'visibility':'on'},{'lightness':33}]},
                        {'featureType':'landscape','elementType':'all','stylers':[{'color':'#f2e5d4'}]},
                        {'featureType':'poi.park','elementType':'geometry','stylers':[{'color':'#c5dac6'}]},
                        {'featureType':'poi.park','elementType':'labels','stylers':[{'visibility':'on'},{'lightness':20}]},
                        {'featureType':'road','elementType':'all','stylers':[{'lightness':20}]},
                        {'featureType':'road.highway','elementType':'geometry','stylers':[{'color':'#c5c6c6'}]},
                        {'featureType':'road.arterial','elementType':'geometry','stylers':[{'color':'#e4d7c6'}]},
                        {'featureType':'road.local','elementType':'geometry','stylers':[{'color':'#fbfaf7'}]},
                        {'featureType':'water','elementType':'all','stylers':[{'visibility':'on'},{'color':'#acbcc9'}]}
                    ];
                    break;

                case 6:             //  Blush
                    styles = [
                        {'stylers':[{'hue':'#dd0d0d'}]},{'featureType':'road','elementType':'labels','stylers':[{'visibility':'off'}]},
                        {'featureType':'road','elementType':'geometry','stylers':[{'lightness':100},{'visibility':'simplified'}]}
                    ];
                    break;
            }

            if (!showRoads) {
                styles.push({
                    'featureType': 'road',
                    'stylers': [{
                        'visibility': 'off'
                    }]
                });
            }
            if (!showRoads) {
                styles.push({
                    'featureType': 'administrative',
                    'elementType': 'geometry',
                    'stylers': [{
                        'visibility': 'off'
                    }]
                });
                styles.push({
                    'featureType': 'poi',
                    'stylers': [{
                        'visibility': 'off'
                    }]
                });
                styles.push({
                    'featureType': 'road',
                    'elementType': 'labels.icon',
                    'stylers': [{
                        'visibility': 'off'
                    }]
                });
                styles.push({
                    'featureType': 'transit',
                    'stylers': [{
                        'visibility': 'off'
                    }]
                });
            }

            if (!showLabels) {
                styles.push({
                    'elementType': 'labels',
                    'stylers': [{
                        'visibility': 'off'
                    }]
                });
                styles.push({
                    'featureType': 'administrative.land_parcel',
                    'stylers': [{
                        'visibility': 'off'
                    }]
                });
                styles.push({
                    'featureType': 'administrative.neighborhood',
                    'stylers': [{
                        'visibility': 'off'
                    }]
                });

            }
            return styles;
        }
    }

    var provider = {
        $scope: null,
        $timeout: null,
        timerPoll: 250,
        timeout: 15000,
        init: function (s, t) {
            $scope = s;
            $timeout = t;
        },
        destroy: function() {
            terratypeGoogleMapV3.cancelEventHandler($scope);
        },
        definitionSetup: function () {
            //alert('configSetup');
        },
        apperanceSetup: function () {
            datumChange($scope.model.value.position.datum);
            loadMap();
            $scope.$on('setProvider', function() {
                if (provider.$scope.bag.provider.id != 'GoogleMapsV3') {
                    provider.destroy.call(provider);
                }
            });
            $scope.$on('setCoordinateSystems', function() {
                if (provider.$scope.bag.position.id != provider.attempt.coordinateSystem) {
                    provider.loadMap.call(provider, $scope.model.value.provider.apiKey);
                }
            });
        },
        parse: function (text) {
            var args = text.trim().split(',');
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
            return {
                latitude: lat,
                longitude: lng
            }
        },
        toString: function (datum) {
            function encodelatlng(latlng) {
                return Number(latlng).toFixed($scope.bag.position.precision).replace(/\.?0+$/, '');
            }
            return encodelatlng(datum.latitude) + ',' + encodelatlng(datum.longitude);
        },
        datumChange: function (text) {
            if (!angular.isUndefined(text)) {
                var datum = toString(text);
                if (typeof datum !== 'boolean') {
                    $scope.bag.position.datumText = datum;
                    bag.position.datumStyle = {};
                    return;
                }
            }
            bag.position.datumStyle = { 'color': 'red' };
        },
        configconfig:
            {
                defaultPosition: {
                    datum: {
                        latitude: 55.4063207,
                        longitude: 10.3870147
                    }
                },
                zoom: 17,
                icon: {
                    image: 'https://mt.google.com/vt/icon/name=icons/spotlight/spotlight-poi.png'
                },
                predefineMapColor: 0,
                showRoads: true,
                showLandmarks: true,
                showLabels: true,
                streetViewControl: {
                    enable: false
                },
                mapScaleControl: false,
                fullScreenControl: true,
                zoomControl: {
                    enable: true,
                    position: 0,
                    zoomControlStyle: 0
                },
                panControl: {
                    enable: false
                },
                draggable: true,
                predefineMapColor: 6,
                showRoads: true,
                showLandmarks: true,
                showLabels: true
            },
        loadMap: function (config) {
            if (!config) {
                config = configconfig;
            }
            $scope.bag.provider.apiKeyLoading = true;
            $scope.bag.provider.apiKeyFailed = false;
            $scope.bag.provider.apiKeySuccess = false;
            terratypeGoogleMapV3.registerEventHandler.call(terratypeGoogleMapV3, $scope);
            $scope.$on('gmaperror', function () {
                $scope.bag.provider.apiKeyLoading = false;
                $scope.bag.provider.apiKeyFailed = true;
                $scope.bag.provider.apiKeySuccess = false;
            });
            $scope.$on('gmapkilled', function () {
                $scope.bag.provider.apiKeyLoading = false;
                $scope.bag.provider.apiKeyFailed = false;
                $scope.bag.provider.apiKeySuccess = false;
            });
            $scope.$on('gmaploaded', function () {
                $scope.bag.provider.apiKeyLoading = false;
                $scope.bag.provider.apiKeyFailed = false;
                $scope.bag.provider.apiKeySuccess = true;
                $scope.bag.provider.ignoreEvents = 0;

                $scope.bag.provider.gmap = new google.maps.Map(document.getElementById('terratype_' + $scope.model.alias + '_googlemapv3_map'), {
                    disableDefaultUI: true,
                    scrollwheel: false,
                    panControl: config.panControl,
                    scaleControl: config.mapScaleControl,
                    center: {
                        lat: config.defaultPosition.datum.latitude,
                        lng: config.defaultPosition.datum.longitude
                    },
                    zoom: config.zoom,
                    draggable: config.draggable,
                    fullScreenControl: config.fullScreenControl,
                    styles: terratypeGoogleMapV3.style.call(terratypeGoogleMapV3, config.predefineMapColor, config.showRoads, config.showLandmarks, config.showLabels)
                });
                google.maps.event.addListener($scope.bag.provider.gmap, 'zoom_changed', $scope.bag.provider.eventZoom);
                google.maps.event.addListenerOnce($scope.bag.provider.gmap, 'tilesloaded', $scope.bag.provider.eventRefresh);
                google.maps.event.addListener($scope.bag.provider.gmap, 'resize', $scope.bag.provider.eventCheckRefresh);
                $scope.bag.provider.gmarker = new google.maps.Marker({
                    map: $scope.bag.provider.gmap,
                    position: {
                        lat: $scope.model.value.position.datum.latitude,
                        lng: $scope.model.value.position.datum.longitude
                    },
                    id: 'terratype_' + $scope.model.alias + '_marker',
                    draggable: true,
                    icon: terratypeGoogleMapV3.icon.call(terratypeGoogleMapV3, config.icon)
                })
                google.maps.event.addListener($scope.bag.provider.gmarker, 'dragend', $scope.bag.provider.eventDrag);
            });
        },
        eventZoom: function () {
            if ($scope.bag.provider.ignoreEvents > 0) {
                return;
            }
            $scope.model.value.zoom = $scope.bag.provider.gmap.getZoom();
        },
        eventRefresh: function () {
            if ($scope.bag.provider.ignoreEvents > 0) {
                return;
            }
            $scope.bag.provider.ignoreEvents++;
            $scope.bag.provider.gmap.setZoom($scope.model.value.zoom);
            var latlng = {
                lat: $scope.model.value.position.datum.latitude,
                lng: $scope.model.value.position.datum.longitude
            };
            $scope.bag.provider.gmarker.setPosition(latlng);
            $scope.bag.provider.gmap.panTo(latlng);
            google.maps.event.trigger($scope.bag.provider.gmap, 'resize');
            $scope.bag.provider.ignoreEvents--;
        },
        eventCheckRefresh: function () {
            if (!$scope.bag.provider.gmap.getBounds().contains($scope.bag.provider.gmarker.getPosition())) {
                eventRefresh();
            }
        },
        eventDrag: function (marker) {
            if ($scope.bag.provider.ignoreEvents > 0) {
                return;
            }
            $scope.bag.provider.ignoreEvents++;
            $scope.model.value.position.datum = {
                latitude: marker.latLng.lat(),
                longitude: marker.latLng.lng()
            };
            datumChange($scope.model.value.position.datum);
            $scope.bag.provider.ignoreEvents--;
        }
    };

    root.terratypeProvider['GoogleMapsV3'] = provider;
}(window));
