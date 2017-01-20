(function (root) {

    //  Subsystem that loads or destroys Google Map library
    var gm = {
        originalConsole: root.console,
        domain: null,
        apiKey : null,
        coordinateSystem: null,
        forceHttps: false,
        language: null,
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
        timeout: 10000,
        fakeConsole: {
            isFake: true,
            error: function (a) {
                if ((a.indexOf('Google Maps API') != -1 || a.indexOf('Google Maps Javascript API') != -1) &&
                    (a.indexOf('MissingKeyMapError') != -1 || a.indexOf('ApiNotActivatedMapError') != -1 ||
                    a.indexOf('InvalidKeyMapError') != -1 || a.indexOf('not authorized') != -1 || a.indexOf('RefererNotAllowedMapError') != -1)) {
                    gm.raiseEvent('gmaperror');
                    gm.destroySubsystem();
                }
                try {
                    gm.originalConsole.error(a);
                }
                catch (oh) {
                }
            },
            warn: function (a) {
                try {
                    gm.originalConsole.warn(a);
                }
                catch (oh) {
                }
            },
            log: function (a) {
                try {
                    gm.originalConsole.log(a);
                }
                catch (oh) {
                }
            }
        },
        installFakeConsole: function () {
            if (typeof (root.console.isFake) === 'undefined') {
                root.console = gm.fakeConsole;
            }
        },
        uninstallFakeConsole: function () {
            root.console = gm.originalConsole;
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
            return gm.registeredEvents.map(function (x) { return x.$id; }).indexOf(scope.$id);
        },
        registerEventHandler: function (scope) {
            if (gm.indexEventHandler(scope) == -1) {
                gm.registeredEvents.push(scope);
                return true;
            }
            return false;
        },
        cancelEventHandler: function (scope) {
            var index = gm.indexEventHandler(scope);
            if (index != -1) {
                gm.registeredEvents.splice(index, 1);
            }
            if (gm.registeredEvents.length == 0 && gm.status != gm.subsystemUninitiated) {
                //  Nobody left talking to us, so kill
                gm.destroySubsystem();
            }
        },
        raiseEvent: function (name) {
            angular.forEach(gm.registeredEvents, function (event, index) {
                event.$broadcast(name);
            });
        },
        destroySubsystem: function () {
            gm.uninstallFakeConsole();
            delete google;
            if (gm.domain) {
                gm.uninstallScript(gm.domain);
                gm.domain = null;
            }
            gm.status = gm.subsystemUninitiated;
            gm.killswitch = true;
            //gm.registeredEvents = [];
        },
        ticks: function () {
            return (new Date().getTime());
        },
        createSubsystem: function (apiKey, forceHttps, coordinateSystem, language) {
            root.TerratypeGoogleMapsV3Callback = function  () {
                gm.status = gm.subsystemCheckGoogleJs;
            }
            var start = gm.ticks() + gm.timeout;
            var wait = setInterval(function () {
                gm.originalConsole.warn('Waiting for previous subsystem to die');
                if (gm.ticks() > start) {
                    clearInterval(wait);
                    gm.raiseEvent('gmapkilled');
                    gm.destroySubsystem();
                } else if (gm.status == gm.subsystemCompleted || gm.status == gm.subsystemUninitiated || gm.status == gm.subsystemInit) {
                    gm.originalConsole.warn('Creating new subsystem');
                    clearInterval(wait);
                    gm.forceHttps = forceHttps;
                    var https = '';
                    if (forceHttps) {
                        https = 'https:';
                    }
                    gm.coordinateSystem = coordinateSystem;

                    gm.domain = https + ((coordinateSystem == 'GCJ02') ? '//maps.google.cn/' : '//maps.googleapis.com/');
                    gm.status = gm.subsystemInit;
                    gm.killswitch = false;

                    gm.apiKey = apiKey;
                    var key = '';
                    if (apiKey) {
                        key = '&key=' + apiKey;
                    }

                    gm.language = language;
                    var lan = '';
                    if (language) {
                        lan = '&language' + language;
                    }

                    start = gm.ticks() + gm.timeout;
                    var timer = setInterval(function () {
                        if (gm.killswitch) {
                            clearInterval(timer);
                        } else {
                            gm.originalConsole.warn('Subsystem status ' + gm.status);
                            switch (gm.status)
                            {
                                case gm.subsystemInit:
                                    LazyLoad.js(gm.domain + 'maps/api/js?v=3&libraries=places&callback=TerratypeGoogleMapsV3Callback' + key + lan);
                                    gm.status = gm.subsystemReadGoogleJs;
                                    break;

                                case gm.subsystemReadGoogleJs:
                                    if (gm.ticks() > start) {
                                        clearInterval(timer);
                                        gm.raiseEvent('gmaperror');
                                        gm.destroySubsystem();
                                    }
                                    break;

                                case gm.subsystemCheckGoogleJs:
                                    if (gm.ticks() > start) {
                                        clearInterval(timer);
                                        gm.raiseEvent('gmaperror');
                                        gm.destroySubsystem();
                                    } else if (gm.isGoogleMapsLoaded()) {
                                        gm.installFakeConsole();
                                        gm.status = gm.subsystemLoadedGoogleJs;
                                        gm.raiseEvent('gmaploaded');
                                    }
                                    break;

                                case gm.subsystemLoadedGoogleJs:
                                    gm.status = gm.subsystemCooloff;
                                    start = gm.ticks() + gm.timeout;
                                    break;

                                case gm.subsystemCooloff:
                                    if (gm.ticks() > start) {
                                        gm.status = gm.subsystemCompleted;
                                        gm.uninstallFakeConsole();
                                    }
                                    break;

                                case gm.subsystemCompleted:
                                    if (gm.registeredEvents.length == 0) {
                                        clearInterval(timer);
                                    } else {
                                        gm.raiseEvent('gmaprefresh');
                                    }
                            }
                        }
                    }, gm.poll);
                } else {
                    gm.killswitch = true;
                }
            }, gm.poll)
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
            
            switch (+color)
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
            if (!showLandmarks) {
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

    var pr = {
        $scope: null,
        $timeout: null,
        timerPoll: 250,
        timeout: 15000,
        init: function (s, t) {
            pr.$scope = s;
            pr.$timeout = t;
        },
        destroy: function() {
            gm.cancelEventHandler.call(gm, pr.$scope);
        },
        definitionSetup: function () {
            //alert('configSetup');
        },
        reloadMap: function () {
            pr.destroy.call(pr);
            pr.loadMap.call(pr);
        },
        apperanceSetup: function () {
            if (angular.isDefined(pr.$scope.model.value.position)) {
                pr.loadMap.call(pr);
            }
            pr.$scope.$on('setProvider', function() {
                if (pr.$scope.bag.provider.id != 'GoogleMapsV3') {
                    pr.destroy.call(pr);
                }
            });
            pr.$scope.$on('setCoordinateSystems', function() {
                if (pr.$scope.bag.position.id != pr.coordinateSystem) {
                    pr.reloadMap.call(pr);
                }
            });
        },
        forceHttpsChange: function () {
            if (pr.$scope.model.value.provider.forceHttps != gm.forceHttps) {
                pr.reloadMap.call(pr);
            }
        },
        languageChange: function () {
            if (pr.$scope.model.value.provider.language != gm.language) {
                pr.reloadMap.call(pr);
            }
        },
        styleChange: function () {
            if (pr.$scope.bag.provider.gmap) {
                pr.$scope.bag.provider.gmap.setOptions({
                    styles: gm.style.call(gm, pr.$scope.model.value.provider.predefineMapColor, pr.$scope.model.value.provider.showRoads,
                        pr.$scope.model.value.provider.showLandmarks, pr.$scope.model.value.provider.showLabels)
                });
            }
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
                return Number(latlng).toFixed(pr.$scope.bag.position.precision).replace(/\.?0+$/, '');
            }
            return encodelatlng(datum.latitude) + ',' + encodelatlng(datum.longitude);
        },
        datumChange: function (text) {
            if (!angular.isUndefined(text) && text != null) {
                var datum = pr.toString(text);
                if (typeof datum !== 'boolean') {
                    pr.$scope.bag.position.datumText = datum;
                    pr.$scope.bag.position.datumStyle = {};
                    return;
                }
            }
            pr.$scope.bag.position.datumStyle = { 'color': 'red' };
        },
        configconfig:
            {
                defaultPosition: {
                    datum: {
                        latitude: 55.4063207,
                        longitude: 10.3870147
                    }
                },
                zoom: 12,
                icon: {
                    image: 'https://mt.google.com/vt/icon/name=icons/spotlight/spotlight-poi.png'
                },
                predefineMapColor: 2,
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
            },
        loadMap: function (config) {
            gm.originalConsole.warn('Load map');
            if (!config) {
                config = pr.configconfig;
            }
            pr.$scope.bag.provider.apiKeyLoading = true;
            pr.$scope.bag.provider.apiKeyFailed = false;
            pr.$scope.bag.provider.apiKeyDuplicate = false;
            pr.$scope.bag.provider.apiKeySuccess = false;
            pr.$scope.bag.provider.gmapCompleted = false;
            pr.$scope.bag.provider.showMap = false;
            pr.$scope.bag.provider.gmap = null;
            gm.registerEventHandler.call(gm, pr.$scope);
            var div = 'terratype_' + pr.$scope.model.alias + '_googlemapv3_map';
            pr.$scope.$on('gmaperror', function () {
                gm.originalConsole.warn('Map error');
                pr.$scope.bag.provider.apiKeyLoading = false;
                pr.$scope.bag.provider.apiKeyFailed = true;
                pr.$scope.bag.provider.apiKeyDuplicate = false;
                pr.$scope.bag.provider.apiKeySuccess = false;
                gm.cancelEventHandler.call(gm, pr.$scope);
                pr.$scope.$apply();
            });
            pr.$scope.$on('gmapkilled', function () {
                gm.originalConsole.warn('Map killed');
                pr.$scope.bag.provider.apiKeyLoading = false;
                pr.$scope.bag.provider.apiKeyFailed = false;
                pr.$scope.bag.provider.apiKeyDuplicate = false;
                pr.$scope.bag.provider.apiKeySuccess = false;
                gm.cancelEventHandler.call(gm, pr.$scope);
                pr.$scope.$apply();
            });
            pr.$scope.$on('gmaploaded', function () {
                gm.originalConsole.warn('Map loaded');
                pr.$scope.bag.provider.apiKeyLoading = false;
                pr.$scope.bag.provider.apiKeyFailed = false;
                pr.$scope.bag.provider.apiKeyDuplicate = false;
                pr.$scope.bag.provider.apiKeySuccess = true;

                //  Check that we have loaded with the right setting for us
                if (gm.apiKey != pr.$scope.model.value.provider.apiKey ||
                    gm.coordinateSystem != pr.$scope.model.value.position.id ||
                    gm.forceHttps != pr.$scope.model.value.provider.forceHttps ||
                    gm.language != pr.$scope.model.value.provider.language)
                {
                    pr.$scope.bag.provider.apiKeyDuplicate = true;
                    gm.cancelEventHandler.call(gm, pr.$scope);
                    pr.$scope.$apply();
                    return;
                }
                pr.$scope.bag.provider.ignoreEvents = 0;
                if (!(pr.$scope.model.value.position && pr.$scope.model.value.position.datum && 
                    pr.$scope.model.value.position.latitude && pr.$scope.model.value.position.longitude))
                {
                    pr.$scope.model.value.position.datum = {
                        latitude: config.defaultPosition.datum.latitude,
                        longitude: config.defaultPosition.datum.longitude
                    }
                }
                if (!(pr.$scope.model.value.position && pr.$scope.model.value.zoom)) {
                    pr.$scope.model.value.zoom = config.zoom;
                }
                if (!(pr.$scope.model.value.provider && pr.$scope.model.value.provider.predefineMapColor &&
                    pr.$scope.model.value.provider.showRoads && pr.$scope.model.value.provider.showLandmarks && pr.$scope.model.value.provider.showLabels)) {
                    pr.$scope.model.value.provider.predefineMapColor = config.predefineMapColor;
                    pr.$scope.model.value.provider.showRoads = config.showRoads;
                    pr.$scope.model.value.provider.showLandmarks = config.showLandmarks;
                    pr.$scope.model.value.provider.showLabels = config.showLabels;
                };
                var latlng = {
                    lat: pr.$scope.model.value.position.datum.latitude,
                    lng: pr.$scope.model.value.position.datum.longitude
                };

                pr.$scope.bag.provider.gmap = new google.maps.Map(document.getElementById(div), {
                    disableDefaultUI: false,
                    scrollwheel: false,
                    panControl: config.panControl.enable,
                    scaleControl: config.mapScaleControl,
                    center: latlng,
                    zoom: pr.$scope.model.value.zoom,
                    draggable: config.draggable,
                    fullScreenControl: config.fullScreenControl,
                    styles: gm.style.call(gm, config.predefineMapColor, config.showRoads, config.showLandmarks, config.showLabels)
                });
                google.maps.event.addListener(pr.$scope.bag.provider.gmap, 'zoom_changed', pr.$scope.bag.provider.eventZoom);
                google.maps.event.addListenerOnce(pr.$scope.bag.provider.gmap, 'tilesloaded', pr.$scope.bag.provider.eventRefresh);
                google.maps.event.addListener(pr.$scope.bag.provider.gmap, 'resize', pr.$scope.bag.provider.eventCheckRefresh);
                pr.$scope.bag.provider.gmarker = new google.maps.Marker({
                    map: pr.$scope.bag.provider.gmap,
                    position: latlng,
                    id: 'terratype_' + pr.$scope.model.alias + '_marker',
                    draggable: true,
                    icon: gm.icon.call(gm, config.icon)
                })
                google.maps.event.addListener(pr.$scope.bag.provider.gmarker, 'dragend', pr.$scope.bag.provider.eventDrag);
                pr.$scope.bag.provider.showMap = true;
                pr.datumChange.call(pr, pr.$scope.model.value.position.datum);
                pr.$scope.$apply();
            });
            var oldSize = 0;
            pr.$scope.$on('gmaprefresh', function () {
                var element = document.getElementById(div);
                if (element == null) {
                    gm.cancelEventHandler.call(gm, pr.$scope);
                    return;
                }
                var newValue = element.offsetTop;
                var newSize = element.clientHeight * element.clientWidth;
                if (newValue != 0 && pr.$scope.bag.provider.showMap == false) {
                    //  Was hidden, now being shown
                    pr.$scope.bag.provider.showMap = true;
                    pr.$timeout(pr.$scope.bag.provider.eventRefresh);
                    pr.$scope.$apply();
                } else if (newValue == 0 && pr.$scope.bag.provider.showMap == true) {
                    //  Was shown, now being hidden
                    pr.$scope.bag.provider.showMap = false;
                    pr.$scope.$apply();
                }
                else if (pr.$scope.bag.provider.showMap == true && oldSize != 0 && newSize != 0 && oldSize != newSize) {
                    pr.$timeout(pr.$scope.bag.provider.eventCheckRefresh);
                }
                oldSize = newSize;
            });

            if (gm.status == gm.subsystemUninitiated) {
                gm.createSubsystem(pr.$scope.model.value.provider.apiKey, pr.$scope.model.value.provider.forceHttps,
                    pr.$scope.model.value.position.id, pr.$scope.model.value.provider.language);
            }
        },
        eventZoom: function () {
            if (pr.$scope.bag.provider.ignoreEvents > 0) {
                return;
            }
            gm.originalConsole.warn('eventZoom');
            pr.$scope.model.value.zoom = pr.$scope.bag.provider.gmap.getZoom();
        },
        eventRefresh: function () {
            if (pr.$scope.bag.provider.ignoreEvents > 0) {
                return;
            }
            gm.originalConsole.warn('eventRefresh');
            pr.$scope.bag.provider.ignoreEvents++;
            pr.$scope.bag.provider.gmap.setZoom(pr.$scope.model.value.zoom);
            var latlng = {
                lat: pr.$scope.model.value.position.datum.latitude,
                lng: pr.$scope.model.value.position.datum.longitude
            };
            pr.$scope.bag.provider.gmarker.setPosition(latlng);
            pr.$scope.bag.provider.gmap.panTo(latlng);
            google.maps.event.trigger(pr.$scope.bag.provider.gmap, 'resize');
            pr.$scope.bag.provider.ignoreEvents--;
        },
        eventCheckRefresh: function () {
            if (!pr.$scope.bag.provider.gmap.getBounds().contains(pr.$scope.bag.provider.gmarker.getPosition())) {
                pr.eventRefresh.call(pr);
            }
        },
        eventDrag: function (marker) {
            if (pr.$scope.bag.provider.ignoreEvents > 0) {
                return;
            }
            gm.originalConsole.warn('eventDrag');
            pr.$scope.bag.provider.ignoreEvents++;
            pr.$scope.model.value.position.datum = {
                latitude: marker.latLng.lat(),
                longitude: marker.latLng.lng()
            };
            pr.datumChange.call(pr, pr.$scope.model.value.position.datum);
            pr.$scope.bag.provider.ignoreEvents--;
        }
    };

    root.terratypeProvider['GoogleMapsV3'] = pr;
}(window));
