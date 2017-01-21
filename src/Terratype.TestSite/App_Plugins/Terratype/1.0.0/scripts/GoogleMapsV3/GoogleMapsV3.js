(function (root) {

    var event = {
        events: [],
        register: function (id, name, scope, object, func) {
            event.events.push({
                id: id,
                name: name,
                func: func,
                scope: scope,
                object: object
            });
        },
        cancel: function (id) {
            var newEvents = [];
            angular.forEach(event.events, function (e, i) {
                if (e.id != id) {
                    newEvents.push(e);
                }
            });
            event.events = newEvents;
        },
        broadcast: function (name) {
            angular.forEach(event.events, function (e, i) {
                if (e.name == name) {
                    e.func.call(e.scope, e.object);
                }
            });
        },
        present: function (id) {
            if (id) {
                var count = 0;
                angular.forEach(event.events, function (e, i) {
                    if (e.id != id) {
                        count++;
                    }
                });
                return count;
            }
            return event.events.length;
        }
    }

    //  Subsystem that loads or destroys Google Map library
    var gm = {
        originalConsole: root.console,
        domain: null,
        apiKey : null,
        coordinateSystem: null,
        forceHttps: false,
        language: null,
        subsystemUninitiated: 0,
        subsystemInit: 1,
        subsystemReadGoogleJs: 2,
        subsystemCheckGoogleJs: 3,
        subsystemLoadedGoogleJs: 4,
        subsystemCooloff: 5,
        subsystemCompleted: 6,
        status: 0,
        killswitch: false,
        poll: 330,
        timeout: 10000,
        fakeConsole: {
            isFake: true,
            error: function (a) {
                if ((a.indexOf('Google Maps API') != -1 || a.indexOf('Google Maps Javascript API') != -1) &&
                    (a.indexOf('MissingKeyMapError') != -1 || a.indexOf('ApiNotActivatedMapError') != -1 ||
                    a.indexOf('InvalidKeyMapError') != -1 || a.indexOf('not authorized') != -1 || a.indexOf('RefererNotAllowedMapError') != -1)) {
                    event.broadcast('gmaperror');
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
        destroySubsystem: function () {
            gm.uninstallFakeConsole();
            delete google;
            if (gm.domain) {
                gm.uninstallScript(gm.domain);
                gm.domain = null;
            }
            gm.status = gm.subsystemUninitiated;
            gm.killswitch = true;
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
                //gm.originalConsole.warn('Waiting for previous subsystem to die');
                if (gm.ticks() > start) {
                    clearInterval(wait);
                    event.broadcast('gmapkilled');
                    gm.destroySubsystem();
                } else if (gm.status == gm.subsystemCompleted || gm.status == gm.subsystemUninitiated || gm.status == gm.subsystemInit) {
                    //gm.originalConsole.warn('Creating new subsystem');
                    clearInterval(wait);
                    gm.forceHttps = forceHttps;
                    var https = '';
                    if (forceHttps) {
                        https = 'https:';
                    }
                    if (coordinateSystem == 'GCJ02') {
                        //  maps.google.cn only handles http
                        https = 'http:';
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
                        lan = '&language=' + language;
                    }

                    start = gm.ticks() + gm.timeout;
                    var timer = setInterval(function () {
                        if (gm.killswitch) {
                            clearInterval(timer);
                        } else {
                            //gm.originalConsole.warn('Subsystem status ' + gm.status);
                            switch (gm.status)
                            {
                                case gm.subsystemInit:
                                    LazyLoad.js(gm.domain + 'maps/api/js?v=3&libraries=places&callback=TerratypeGoogleMapsV3Callback' + key + lan);
                                    gm.status = gm.subsystemReadGoogleJs;
                                    break;

                                case gm.subsystemReadGoogleJs:
                                    if (gm.ticks() > start) {
                                        clearInterval(timer);
                                        event.broadcast('gmaperror');
                                        gm.destroySubsystem();
                                    }
                                    break;

                                case gm.subsystemCheckGoogleJs:
                                    if (gm.ticks() > start) {
                                        clearInterval(timer);
                                        event.broadcast('gmaperror');
                                        gm.destroySubsystem();
                                    } else if (gm.isGoogleMapsLoaded()) {
                                        gm.installFakeConsole();
                                        gm.status = gm.subsystemLoadedGoogleJs;
                                        event.broadcast('gmaprefresh');
                                    }
                                    break;

                                case gm.subsystemLoadedGoogleJs:
                                    gm.status = gm.subsystemCooloff;
                                    start = gm.ticks() + gm.timeout;
                                    break;

                                case gm.subsystemCooloff:
                                    event.broadcast('gmaprefresh');
                                    if (gm.ticks() > start) {
                                        gm.status = gm.subsystemCompleted;
                                        gm.uninstallFakeConsole();
                                    }
                                    break;

                                case gm.subsystemCompleted:
                                    if (event.present() == 0) {
                                        clearInterval(timer);
                                    } else {
                                        event.broadcast('gmaprefresh');
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
        style: function (name, showRoads, showLandmarks, showLabels) {
            var styles = [];
            
            switch (name)
            {
                case 'silver':             //  Silver
                    styles = [
                        { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
                        { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
                        { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
                        { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
                        { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
                        { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
                        { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
                        { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
                        { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
                        { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
                        { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dadada" }] },
                        { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
                        { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
                        { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
                        { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
                        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] },
                        { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }
                    ];
                    break;

                case 'retro':             //  Retro
                    styles = [
                        { "elementType": "geometry", "stylers": [{ "color": "#ebe3cd" }] },
                        { "elementType": "labels.text.fill", "stylers": [{ "color": "#523735" }] },
                        { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f1e6" }] },
                        { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#c9b2a6" }] },
                        { "featureType": "administrative.land_parcel", "elementType": "geometry.stroke", "stylers": [{ "color": "#dcd2be" }] },
                        { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#ae9e90" }] },
                        { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [{ "color": "#dfd2ae" }] },
                        { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#dfd2ae" }] },
                        { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#93817c" }] },
                        { "featureType": "poi.park", "elementType": "geometry.fill", "stylers": [{ "color": "#a5b076" }] },
                        { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#447530" }] },
                        { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#f5f1e6" }] },
                        { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#fdfcf8" }] },
                        { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#f8c967" }] },
                        { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#e9bc62" }] },
                        { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [{ "color": "#e98d58" }] },
                        { "featureType": "road.highway.controlled_access", "elementType": "geometry.stroke", "stylers": [{ "color": "#db8555" }] },
                        { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#806b63" }] },
                        { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#dfd2ae" }] },
                        { "featureType": "transit.line", "elementType": "labels.text.fill", "stylers": [{ "color": "#8f7d77" }] },
                        { "featureType": "transit.line", "elementType": "labels.text.stroke", "stylers": [{ "color": "#ebe3cd" }] },
                        { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#dfd2ae" }] },
                        { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "color": "#b9d3c2" }] },
                        { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#92998d" }] }
                    ];
                    break;

                case 'dark':             //  Dark
                    styles = [
                        { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
                        { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
                        { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
                        { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
                        { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
                        { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
                        { "featureType": "administrative.land_parcel", "stylers": [{ "visibility": "off" }] },
                        { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
                        { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
                        { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#181818" }] },
                        { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
                        { "featureType": "poi.park", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1b1b1b" }] },
                        { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
                        { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] },
                        { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#373737" }] },
                        { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#3c3c3c" }] },
                        { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [{ "color": "#4e4e4e" }] },
                        { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
                        { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
                        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
                        { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#3d3d3d" }] }
                    ];
                    break;

                case 'night':             //  Night
                    styles = [
                        { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
                        { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
                        { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
                        { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
                        { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
                        { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
                        { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
                        { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
                        { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
                        { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
                        { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] },
                        { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
                        { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] },
                        { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#2f3948" }] },
                        { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
                        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
                        { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
                        { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
                    ];
                    break;

                case 'desert':             //  Desert
                    styles = [
                        { "featureType": "administrative", "elementType": "all", "stylers": [{ "visibility": "on" }, { "lightness": 33 }] },
                        { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2e5d4" }] },
                        { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#c5dac6" }] },
                        { "featureType": "poi.park", "elementType": "labels", "stylers": [{ "visibility": "on" }, { "lightness": 20 }] },
                        { "featureType": "road", "elementType": "all", "stylers": [{ "lightness": 20 }] },
                        { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#c5c6c6" }] },
                        { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#e4d7c6" }] },
                        { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#fbfaf7" }] },
                        { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#acbcc9" }] }
                    ];
                    break;

                case 'blush':             //  Blush
                    styles = [
                        { "stylers": [{ "hue": "#dd0d0d" }] },
                        { "featureType": "road", "elementType": "geometry", "stylers": [{ "lightness": 100 }, { "visibility": "simplified" }] }
                    ];
                    break;

                case 'unsaturatedbrowns':             //  Unsaturated Browns
                    styles = [
                        { "elementType": "geometry", "stylers": [{ "hue": "#ff4400" }, { "saturation": -68 }, { "lightness": -4 }, { "gamma": 0.72 }] },
                        { "featureType": "road", "elementType": "labels.icon" }, { "featureType": "landscape.man_made", "elementType": "geometry", "stylers": [{ "hue": "#0077ff" }, { "gamma": 3.1 }] },
                        { "featureType": "water", "stylers": [{ "hue": "#00ccff" }, { "gamma": 0.44 }, { "saturation": -33 }] },
                        { "featureType": "poi.park", "stylers": [{ "hue": "#44ff00" }, { "saturation": -23 }] },
                        { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "hue": "#007fff" }, { "gamma": 0.77 }, { "saturation": 65 }, { "lightness": 99 }] },
                        { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "gamma": 0.11 }, { "weight": 5.6 }, { "saturation": 99 }, { "hue": "#0091ff" }, { "lightness": -86 }] },
                        { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "lightness": -48 }, { "hue": "#ff5e00" }, { "gamma": 1.2 }, { "saturation": -23 }] },
                        { "featureType": "transit", "elementType": "labels.text.stroke", "stylers": [{ "saturation": -64 }, { "hue": "#ff9100" }, { "lightness": 16 }, { "gamma": 0.47 }, { "weight": 2.7 }] }
                    ];
                    break;

                case 'lightdream':             //  Light Dream
                    styles = [
                        { "featureType": "landscape", "stylers": [{ "hue": "#FFBB00" }, { "saturation": 43.4 }, { "lightness": 37.6 }, { "gamma": 1 }] },
                        { "featureType": "road.highway", "stylers": [{ "hue": "#FFC200" }, { "saturation": -61.8 }, { "lightness": 45.6 }, { "gamma": 1 }] },
                        { "featureType": "road.arterial", "stylers": [{ "hue": "#FF0300" }, { "saturation": -100 }, { "lightness": 51.2 }, { "gamma": 1 }] },
                        { "featureType": "road.local", "stylers": [{ "hue": "#FF0300" }, { "saturation": -100 }, { "lightness": 52 }, { "gamma": 1 }] },
                        { "featureType": "water", "stylers": [{ "hue": "#0078FF" }, { "saturation": -13.2 }, { "lightness": 2.4 }, { "gamma": 1 }] },
                        { "featureType": "poi", "stylers": [{ "hue": "#00FF6A" }, { "saturation": -1.1 }, { "lightness": 11.2 }, { "gamma": 1 }] }
                    ];
                    break;

                case 'paledawn':             //  Pale Dawn
                    styles = [
                        { "featureType": "administrative", "elementType": "all", "stylers": [{ "lightness": 33 }] },
                        { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2e5d4" }] },
                        { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#c5dac6" }] },
                        { "featureType": "poi.park", "elementType": "labels", "stylers": [{ "lightness": 20 }] },
                        { "featureType": "road", "elementType": "all", "stylers": [{ "lightness": 20 }] },
                        { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#c5c6c6" }] },
                        { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#e4d7c6" }] },
                        { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#fbfaf7" }] },
                        { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#acbcc9" }] }
                    ];
                    break;

                case 'crisp':            //  Crisp
                    styles = [
                        { "featureType": "administrative.country", "elementType": "geometry", "stylers": [{ "visibility": "simplified" }, { "hue": "#ff0000" }] }
                    ];
                    break;

                case 'mapbox':            //  MapBox
                    styles = [
                        { "featureType": "water", "stylers": [{ "saturation": 43 }, { "lightness": -11 }, { "hue": "#0088ff" }] },
                        { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "hue": "#ff0000" }, { "saturation": -100 }, { "lightness": 99 }] },
                        { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#808080" }, { "lightness": 54 }] },
                        { "featureType": "landscape.man_made", "elementType": "geometry.fill", "stylers": [{ "color": "#ece2d9" }] },
                        { "featureType": "poi.park", "elementType": "geometry.fill", "stylers": [{ "color": "#ccdca1" }] },
                        { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#767676" }] },
                        { "featureType": "road", "elementType": "labels.text.stroke", "stylers": [{ "color": "#ffffff" }] },
                        { "featureType": "landscape.natural", "elementType": "geometry.fill", "stylers": [{ "color": "#b8cb93" }] },
                        { "featureType": "poi.sports_complex", "stylers": [{ "visibility": "on" }] }
                    ];
                    break;

                case 'shiftworker':            //  Shift Worker
                    styles = [
                        { "stylers": [{ "saturation": -100 }, { "gamma": 1 }] },
                        { "featureType": "road", "elementType": "geometry", "stylers": [{ "visibility": "simplified" }] },
                        { "featureType": "water", "stylers": [{ "visibility": "on" }, { "saturation": 50 }, { "gamma": 0 }, { "hue": "#50a5d1" }] },
                        { "featureType": "administrative.neighborhood", "elementType": "labels.text.fill", "stylers": [{ "color": "#333333" }] },
                        { "featureType": "road.local", "elementType": "labels.text", "stylers": [{ "weight": 0.5 }, { "color": "#333333" }] },
                        { "featureType": "transit.station", "elementType": "labels.icon", "stylers": [{ "gamma": 1 }, { "saturation": 50 }] }
                    ];
                    break;

                case 'mutedblue':            //  Muted Blue
                    styles = [
                        { "featureType": "all", "stylers": [{ "saturation": 0 }, { "hue": "#e7ecf0" }] },
                        { "featureType": "road", "stylers": [{ "saturation": -70 }] },
                        { "featureType": "water", "stylers": [{ "visibility": "simplified" }, { "saturation": -60 }] }
                    ];
                    break;

                case 'avocado':            //  Avocado
                    styles = [
                        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#aee2e0" }] },
                        { "featureType": "landscape", "elementType": "geometry.fill", "stylers": [{ "color": "#abce83" }] },
                        { "featureType": "poi", "elementType": "geometry.fill", "stylers": [{ "color": "#769E72" }] },
                        { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#7B8758" }] },
                        { "featureType": "poi", "elementType": "labels.text.stroke", "stylers": [{ "color": "#EBF4A4" }] },
                        { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "visibility": "simplified" }, { "color": "#8dab68" }] },
                        { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "visibility": "simplified" }] },
                        { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#5B5B3F" }] },
                        { "featureType": "road", "elementType": "labels.text.stroke", "stylers": [{ "color": "#ABCE83" }] },
                        { "featureType": "road", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
                        { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#A4C67D" }] },
                        { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#9BBF72" }] },
                        { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#EBF4A4" }] },
                        { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#87ae79" }] },
                        { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [{ "color": "#7f2200" }, { "visibility": "off" }] },
                        { "featureType": "administrative", "elementType": "labels.text.stroke", "stylers": [{ "color": "#ffffff" }, { "weight": 4.1 }] },
                        { "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#495421" }] },
                    ];
                    break;

                case 'colbalt':            //  Colbalt
                    styles = [
                        { "featureType": "all", "elementType": "all", "stylers": [{ "invert_lightness": true }, { "saturation": 10 }, { "lightness": 30 }, { "gamma": 0.5 }, { "hue": "#435158" }] }
                    ];
                    break;

                case 'ice':            //  Ice
                    styles = [
                        { "stylers": [{ "hue": "#2c3e50" }, { "saturation": 250 }] },
                        { "featureType": "road", "elementType": "geometry", "stylers": [{ "lightness": 50 }, { "visibility": "simplified" }] },
                    ];
                    break;

                case 'brightandbubbly':            //  Bright & Bubbly
                    styles = [
                        { "featureType": "water", "stylers": [{ "color": "#19a0d8" }] },
                        { "featureType": "administrative", "elementType": "labels.text.stroke", "stylers": [{ "color": "#ffffff" }, { "weight": 6 }] },
                        { "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#e85113" }] },
                        { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#efe9e4" }, { "lightness": -40 }] },
                        { "featureType": "road.arterial", "elementType": "geometry.stroke", "stylers": [{ "color": "#efe9e4" }, { "lightness": -20 }] },
                        { "featureType": "road", "elementType": "labels.text.stroke", "stylers": [{ "lightness": 100 }] },
                        { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "lightness": -100 }] },
                        { "featureType": "road.highway", "elementType": "labels.icon" },
                        { "featureType": "landscape", "stylers": [{ "lightness": 20 }, { "color": "#efe9e4" }] },
                        { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "lightness": 100 }] },
                        { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "lightness": -100 }] },
                        { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "hue": "#11ff00" }] },
                        { "featureType": "poi", "elementType": "labels.text.stroke", "stylers": [{ "lightness": 100 }] },
                        { "featureType": "poi", "elementType": "labels.icon", "stylers": [{ "hue": "#4cff00" }, { "saturation": 58 }] },
                        { "featureType": "poi", "elementType": "geometry", "stylers": [{ "visibility": "on" }, { "color": "#f0e4d3" }] },
                        { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#efe9e4" }, { "lightness": -25 }] },
                        { "featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [{ "color": "#efe9e4" }, { "lightness": -10 }] },
                        { "featureType": "poi", "elementType": "labels", "stylers": [{ "visibility": "simplified" }] }
                    ];
                    break;

                case 'hopper':            //  Hopper
                    styles = [
                        { "featureType": "water", "elementType": "geometry", "stylers": [{ "hue": "#165c64" }, { "saturation": 34 }, { "lightness": -69 }] },
                        { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "hue": "#b7caaa" }, { "saturation": -14 }, { "lightness": -18 }] },
                        { "featureType": "landscape.man_made", "elementType": "all", "stylers": [{ "hue": "#cbdac1" }, { "saturation": -6 }, { "lightness": -9 }] },
                        { "featureType": "road", "elementType": "geometry", "stylers": [{ "hue": "#8d9b83" }, { "saturation": -89 }, { "lightness": -12 }] },
                        { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "hue": "#d4dad0" }, { "saturation": -88 }, { "lightness": 54 }] },
                        { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "hue": "#bdc5b6" }, { "saturation": -89 }, { "lightness": -3 }] },
                        { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "hue": "#bdc5b6" }, { "saturation": -89 }, { "lightness": -26 }] },
                        { "featureType": "poi", "elementType": "geometry", "stylers": [{ "hue": "#c17118" }, { "saturation": 61 }, { "lightness": -45 }] },
                        { "featureType": "poi.park", "elementType": "all", "stylers": [{ "hue": "#8ba975" }, { "saturation": -46 }, { "lightness": -28 }] },
                        { "featureType": "transit", "elementType": "geometry", "stylers": [{ "hue": "#a43218" }, { "saturation": 74 }, { "lightness": -51 }] },
                        { "featureType": "administrative.province", "elementType": "all", "stylers": [{ "hue": "#ffffff" }, { "saturation": 0 }, { "lightness": 100 }] },
                        { "featureType": "administrative.neighborhood", "elementType": "all", "stylers": [{ "hue": "#ffffff" }, { "saturation": 0 }, { "lightness": 100 }] },
                        { "featureType": "administrative.locality", "elementType": "labels", "stylers": [{ "color": "#b7caaa" }, { "weight": 0.1 }] },
                        { "featureType": "administrative.land_parcel", "elementType": "all", "stylers": [{ "hue": "#ffffff" }, { "saturation": 0 }, { "lightness": 100 }] },
                        { "featureType": "administrative", "elementType": "all", "stylers": [{ "hue": "#3a3935" }, { "saturation": 5 }, { "lightness": -57 }] },
                        { "featureType": "poi.medical", "elementType": "geometry", "stylers": [{ "hue": "#cba923" }, { "saturation": 50 }, { "lightness": -46 }] }
                    ];
                    break;

                case 'lost':            //  Lost
                    styles = [
                        { "elementType": "labels", "stylers": [{ "color": "#52270b" }, { "weight": 0.1 }] },
                        { "featureType": "landscape", "stylers": [{ "color": "#f9ddc5" }, { "lightness": -7 }] },
                        { "featureType": "road", "stylers": [{ "color": "#813033" }, { "lightness": 43 }] },
                        { "featureType": "poi.business", "stylers": [{ "color": "#645c20" }, { "lightness": 38 }] },
                        { "featureType": "water", "stylers": [{ "color": "#1994bf" }, { "saturation": -69 }, { "gamma": 0.99 }, { "lightness": 43 }] },
                        { "featureType": "road.local", "elementType": "geometry.fill", "stylers": [{ "color": "#f19f53" }, { "weight": 1.3 }, { "lightness": 16 }] },
                        { "featureType": "poi.business" }, { "featureType": "poi.park", "stylers": [{ "color": "#645c20" }, { "lightness": 39 }] },
                        { "featureType": "poi.school", "stylers": [{ "color": "#a95521" }, { "lightness": 35 }] },
                        { "featureType": "poi.medical", "elementType": "geometry.fill", "stylers": [{ "color": "#813033" }, { "lightness": 38 }] },
                        { "featureType": "poi.sports_complex", "stylers": [{ "color": "#9e5916" }, { "lightness": 32 }] },
                        { "featureType": "poi.government", "stylers": [{ "color": "#9e5916" }, { "lightness": 46 }] },
                        { "featureType": "transit.line", "stylers": [{ "color": "#813033" }, { "lightness": 22 }] },
                        { "featureType": "transit", "stylers": [{ "lightness": 38 }] },
                        { "featureType": "road.local", "elementType": "geometry.stroke", "stylers": [{ "color": "#f19f53" }, { "lightness": -10 }] }
                    ];
                    break;

                case 'redalert':            //  Red Alert
                    styles = [
                        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#ffdfa6" }] },
                        { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#b52127" }] },
                        { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#c5531b" }] },
                        { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#74001b" }, { "lightness": -10 }] },
                        { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#da3c3c" }] },
                        { "featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [{ "color": "#74001b" }] },
                        { "featureType": "road.arterial", "elementType": "geometry.stroke", "stylers": [{ "color": "#da3c3c" }] },
                        { "featureType": "road.local", "elementType": "geometry.fill", "stylers": [{ "color": "#990c19" }] },
                        { "elementType": "labels.text.fill", "stylers": [{ "color": "#ffffff" }] },
                        { "elementType": "labels.text.stroke", "stylers": [{ "color": "#74001b" }, { "lightness": -8 }] },
                        { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#6a0d10" }] },
                        { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#ffdfa6" }, { "weight": 0.4 }] },
                    ];
                    break;

                case 'olddrymud':            //  Old Dry Mud
                    styles = [
                        { "featureType": "landscape", "stylers": [{ "hue": "#FFAD00" }, { "saturation": 50.2 }, { "lightness": -34.8 }, { "gamma": 1 }] },
                        { "featureType": "road.highway", "stylers": [{ "hue": "#FFAD00" }, { "saturation": -19.8 }, { "lightness": -1.8 }, { "gamma": 1 }] },
                        { "featureType": "road.arterial", "stylers": [{ "hue": "#FFAD00" }, { "saturation": 72.4 }, { "lightness": -32.6 }, { "gamma": 1 }] },
                        { "featureType": "road.local", "stylers": [{ "hue": "#FFAD00" }, { "saturation": 74.4 }, { "lightness": -18 }, { "gamma": 1 }] },
                        { "featureType": "water", "stylers": [{ "hue": "#00FFA6" }, { "saturation": -63.2 }, { "lightness": 38 }, { "gamma": 1 }] },
                        { "featureType": "poi", "stylers": [{ "hue": "#FFC300" }, { "saturation": 54.2 }, { "lightness": -14.4 }, { "gamma": 1 }] }
                    ];
                    break;

                case 'flat':            //  Flat
                    styles = [
                        { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#747474" }, { "lightness": "23" }] },
                        { "featureType": "poi.attraction", "elementType": "geometry.fill", "stylers": [{ "color": "#f38eb0" }] },
                        { "featureType": "poi.government", "elementType": "geometry.fill", "stylers": [{ "color": "#ced7db" }] },
                        { "featureType": "poi.medical", "elementType": "geometry.fill", "stylers": [{ "color": "#ffa5a8" }] },
                        { "featureType": "poi.park", "elementType": "geometry.fill", "stylers": [{ "color": "#c7e5c8" }] },
                        { "featureType": "poi.place_of_worship", "elementType": "geometry.fill", "stylers": [{ "color": "#d6cbc7" }] },
                        { "featureType": "poi.school", "elementType": "geometry.fill", "stylers": [{ "color": "#c4c9e8" }] },
                        { "featureType": "poi.sports_complex", "elementType": "geometry.fill", "stylers": [{ "color": "#b1eaf1" }] },
                        { "featureType": "road", "elementType": "geometry", "stylers": [{ "lightness": "100" }] },
                        { "featureType": "road", "elementType": "labels", "stylers": [{ "lightness": "100" }] },
                        { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#ffd4a5" }] },
                        { "featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [{ "color": "#ffe9d2" }] },
                        { "featureType": "road.local", "elementType": "all", "stylers": [{ "visibility": "simplified" }] },
                        { "featureType": "road.local", "elementType": "geometry.fill", "stylers": [{ "weight": "3.00" }] },
                        { "featureType": "road.local", "elementType": "geometry.stroke", "stylers": [{ "weight": "0.30" }] },
                        { "featureType": "road.local", "elementType": "labels.text", "stylers": [{ "visibility": "on" }] },
                        { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#747474" }, { "lightness": "36" }] },
                        { "featureType": "road.local", "elementType": "labels.text.stroke", "stylers": [{ "color": "#e9e5dc" }, { "lightness": "30" }] },
                        { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "lightness": "100" }] },
                        { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#d2e7f7" }] }
                    ];
                    break;

                case 'hotel':            //  Hotel
                    styles = [
                        { "featureType": "landscape.man_made", "elementType": "geometry.fill", "stylers": [{ "lightness": "-5" }] },
                        { "featureType": "landscape.man_made", "elementType": "labels.text.fill", "stylers": [{ "saturation": "21" }] },
                        { "featureType": "landscape.natural", "elementType": "geometry.fill", "stylers": [{ "saturation": "1" }, { "color": "#eae2d3" }, { "lightness": "20" }] },
                        { "featureType": "road.highway", "elementType": "labels.icon", "stylers": [{ "saturation": "39" }, { "lightness": "7" }, { "gamma": "1.06" }, { "hue": "#00b8ff" }, { "weight": "1.44" }] },
                        { "featureType": "road.arterial", "elementType": "geometry.stroke", "stylers": [{ "lightness": "100" }, { "weight": "1.16" }, { "color": "#e0e0e0" }] },
                        { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{ "saturation": "-16" }, { "lightness": "28" }, { "gamma": "0.87" }] },
                        { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "saturation": "-75" }, { "lightness": "-15" }, { "gamma": "1.35" }, { "weight": "1.45" }, { "hue": "#00dcff" }] },
                        { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#626262" }] }, { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "saturation": "19" }, { "weight": "1.84" }] }
                    ];
                    break;
            }

            function setVisibilityOff(s, f, e) {
                angular.forEach(s, function (value) {
                    if ((!f && value.featureType == f) && (!e && value.elementType == e)) {
                        value.styles = {
                            "visibility": "off"
                        }
                        return;
                    }
                });
                var o = {};
                if (f) {
                    o.featureType = f;
                }
                if (e) {
                    o.elementType = e;
                }
                o.stylers = [{
                    "visibility": "off"
                }];
                s.push(o);
                return s;
            }

            if (!showRoads) {
                styles = setVisibilityOff(styles, 'road', 'all');
                //setVisibilityOff(styles, 'road', 'labels.icon');
                //setVisibilityOff(styles, 'road.highway');
                //setVisibilityOff(styles, 'road.arterial');
                //setVisibilityOff(styles, 'road.local');
            }
            if (!showLandmarks) {
                styles = setVisibilityOff(styles, 'administrative', 'geometry');
                styles = setVisibilityOff(styles, 'poi');
                styles = setVisibilityOff(styles, 'transit');
            }

            if (!showLabels) {
                styles = setVisibilityOff(styles, null, 'labels');
                styles = setVisibilityOff(styles, 'administrative');
                styles = setVisibilityOff(styles, 'administrative.land_parcel');
                styles = setVisibilityOff(styles, 'administrative.neighborhood');
            }
            return styles;
        }
    }

    var pr = {
        $scope: 'If you are talking to this you have the wrong instance',
        $timeout: null,
        div: null,
        divoldsize: 0,
        timerPoll: 250,
        timeout: 15000,
        init: function (s, t) {
            this.$scope = s;
            this.$timeout = t;
        },
        reinit: function () {
            event.cancel(this.$scope.identifier);
            if (angular.isDefined(this.$scope.model.value.position)) {
                this.loadMap.call(this, this);
            }
            this.$scope.$on('setProvider', function (s, pr2) {
                if (pr2.$scope.bag.provider.id != 'GoogleMapsV3') {
                    pr2.destroy.call(pr2);
                }
            });
            this.$scope.$on('setCoordinateSystems', function (s, pr2) {
                if (gm.coordinateSystem && pr2.$scope.bag.position.id != gm.coordinateSystem) {
                    pr2.reloadMap.call(pr2);
                }
            });
        },
        destroy: function() {
            event.cancel(this.$scope.identifier);
        },
        reloadMap: function () {
            this.destroy.call(this);
            gm.destroySubsystem();
            this.div = null;
            this.divoldsize = 0;
            if (this.loadMapWait) {
                clearTimeout(this.loadMapWait);
                this.loadMapWait = null;
            }
            this.loadMap.call(this, this);
        },
        forceHttpsChange: function (pr2) {
            if (pr2.$scope.model.value.provider.forceHttps != gm.forceHttps) {
                pr2.reloadMap.call(pr2);
            }
        },
        languageChange: function (pr2) {
            if (pr2.$scope.model.value.provider.language != gm.language) {
                pr2.reloadMap.call(pr2);
            }
        },
        styleChange: function (pr2) {
            if (pr2.$scope.bag.provider.gmap) {
                pr2.$scope.bag.provider.gmap.setOptions({
                    styles: gm.style.call(gm, pr2.$scope.model.value.provider.predefineStyling, pr2.$scope.model.value.provider.showRoads,
                        pr2.$scope.model.value.provider.showLandmarks, pr2.$scope.model.value.provider.showLabels)
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
        toString: function (datum, precision) {
            function encodelatlng(latlng) {
                return Number(latlng).toFixed(precision).replace(/\.?0+$/, '');
            }
            return encodelatlng(datum.latitude) + ',' + encodelatlng(datum.longitude);
        },
        datumChangeWait: null,
        datumChangeText: null,
        datumChange: function (pr2, text) {
            pr2.datumChangeText = text;
            if (pr2.datumChangeWait) {
                clearTimeout(pr2.datumChangeWait);
            }
            pr2.datumChangeWait = setTimeout(function () {
                pr2.datumChangeWait = null;
                var p = pr2.parse(pr2.datumChangeText);
                if (typeof p !== 'boolean') {
                    pr2.$scope.model.value.position.datum = p;
                    pr2.$scope.bag.position.datumStyle = {};
                    if (pr2.$scope.bag.provider.gmap && pr2.$scope.bag.provider.gmarker) {
                        var latlng = new google.maps.LatLng(pr2.$scope.model.value.position.datum.latitude, pr2.$scope.model.value.position.datum.longitude);
                        pr2.$scope.bag.provider.gmarker.setPosition(latlng);
                        pr2.$scope.bag.provider.gmap.panTo(latlng);
                    }
                    return;
                }
                pr2.$scope.bag.position.datumStyle = { 'color': 'red' };
            }, 1000);
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
                predefineStyling: 2,
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
        loadMapWait: null,
        loadMap: function (pr, config) {
            if (pr.loadMapWait == null) {
                pr.loadMapWait = setTimeout(function () {
                    gm.originalConsole.warn(pr.$scope.identifier + ': Loading map');
                    pr.loadMapWait = null;
                    if (!config) {
                        config = pr.configconfig;
                    }
                    pr.$scope.bag.provider.statusLoading = true;
                    pr.$scope.bag.provider.statusFailed = false;
                    pr.$scope.bag.provider.statusError = false;
                    pr.$scope.bag.provider.statusDuplicate = false;
                    pr.$scope.bag.provider.statusSuccess = false;
                    pr.$scope.bag.provider.showMap = false;
                    pr.$scope.bag.provider.gmap = null;
                    event.register(pr.$scope.identifier, 'gmaperror', pr, pr, function (pr2) {
                        gm.originalConsole.warn(pr2.$scope.identifier + ': Map error');
                        pr2.$scope.bag.provider.statusLoading = false;
                        pr2.$scope.bag.provider.statusFailed = true;
                        pr2.$scope.bag.provider.statusError = false;
                        pr2.$scope.bag.provider.statusDuplicate = false;
                        pr2.$scope.bag.provider.statusSuccess = false;
                        event.cancel(pr2.$scope.identifier);
                        pr2.$scope.$apply();
                    });
                    event.register(pr.$scope.identifier, 'gmapkilled', pr, pr, function (pr2) {
                        gm.originalConsole.warn(pr2.$scope.identifier + ': Map killed');
                        pr2.$scope.bag.provider.statusLoading = false;
                        pr2.$scope.bag.provider.statusFailed = false;
                        pr2.$scope.bag.provider.statusError = false;
                        pr2.$scope.bag.provider.statusDuplicate = false;
                        pr2.$scope.bag.provider.statusSuccess = false;
                        event.cancel(pr2.$scope.identifier);
                        pr2.$scope.$apply();
                    });
                    event.register(pr.$scope.identifier, 'gmaprefresh', pr, pr, function (pr2) {
                        gm.originalConsole.warn(pr2.$scope.identifier + ': Map refresh(). div=' + pr2.div + ', gmap=' + pr2.$scope.bag.provider.gmap);
                        if (pr2.div == null) {
                            pr2.$scope.bag.provider.statusLoading = false;
                            pr2.$scope.bag.provider.statusFailed = false;
                            pr2.$scope.bag.provider.statusError = false;
                            pr2.$scope.bag.provider.statusDuplicate = false;
                            pr2.$scope.bag.provider.statusSuccess = true;

                            //  Check that we have loaded with the right setting for us
                            if (gm.apiKey != pr2.$scope.model.value.provider.apiKey ||
                                gm.coordinateSystem != pr2.$scope.model.value.position.id ||
                                gm.forceHttps != pr2.$scope.model.value.provider.forceHttps ||
                                gm.language != pr2.$scope.model.value.provider.language) {
                                pr2.$scope.bag.provider.statusDuplicate = true;
                                event.cancel($scope.identifier);
                                pr2.$scope.$apply();
                                return;
                            }
                            pr2.$scope.bag.provider.ignoreEvents = 0;
                            if (!(pr2.$scope.model.value.position && pr2.$scope.model.value.position.datum &&
                                pr2.$scope.model.value.position.latitude && pr2$scope.model.value.position.longitude)) {
                                pr2.$scope.model.value.position.datum = {
                                    latitude: config.defaultPosition.datum.latitude,
                                    longitude: config.defaultPosition.datum.longitude
                                }
                            }
                            if (!(pr2.$scope.model.value.position && pr2.$scope.model.value.zoom)) {
                                pr2.$scope.model.value.zoom = config.zoom;
                            }
                            if (!(pr2.$scope.model.value.provider && pr2.$scope.model.value.provider.predefineStyling &&
                                pr2.$scope.model.value.provider.showRoads && pr2.$scope.model.value.provider.showLandmarks && pr2.$scope.model.value.provider.showLabels)) {
                                pr2.$scope.model.value.provider.predefineStyling = config.predefineStyling;
                                pr2.$scope.model.value.provider.showRoads = config.showRoads;
                                pr2.$scope.model.value.provider.showLandmarks = config.showLandmarks;
                                pr2.$scope.model.value.provider.showLabels = config.showLabels;
                            };
                            pr2.div = 'terratype_' + pr2.$scope.identifier + '_googlemapv3_map';
                            pr2.$scope.bag.provider.showMap = true;
                            pr2.$scope.$apply();
                        } else if (pr2.$scope.bag.provider.gmap == null) {
                            var latlng = new google.maps.LatLng(pr2.$scope.model.value.position.datum.latitude, pr2.$scope.model.value.position.datum.longitude);
                            pr2.$scope.bag.provider.gmap = new google.maps.Map(document.getElementById(pr2.div), {
                                disableDefaultUI: false,
                                scrollwheel: false,
                                panControl: config.panControl.enable,
                                scaleControl: config.mapScaleControl,
                                center: latlng,
                                zoom: pr2.$scope.model.value.zoom,
                                draggable: config.draggable,
                                fullScreenControl: config.fullScreenControl,
                                styles: gm.style.call(gm, config.predefineStyling, config.showRoads, config.showLandmarks, config.showLabels)
                            });
                            google.maps.event.addListener(pr2.$scope.bag.provider.gmap, 'zoom_changed', function () {
                                pr2.$scope.bag.provider.eventZoom.call(pr2, pr2);
                            });
                            google.maps.event.addListenerOnce(pr2.$scope.bag.provider.gmap, 'tilesloaded', function () {
                                pr2.$scope.bag.provider.eventRefresh.call(pr2, pr2);
                            });
                            google.maps.event.addListener(pr2.$scope.bag.provider.gmap, 'resize', function () {
                                pr2.$scope.bag.provider.eventCheckRefresh.call(pr2, pr2);
                            });
                            pr2.$scope.bag.provider.gmarker = new google.maps.Marker({
                                map: pr2.$scope.bag.provider.gmap,
                                provider: pr2,
                                position: latlng,
                                id: 'terratype_' + pr2.$scope.identifier + '_marker',
                                draggable: true,
                                icon: gm.icon.call(gm, config.icon)
                            })
                            google.maps.event.addListener(pr2.$scope.bag.provider.gmarker, 'dragend', function (marker) {
                                pr2.$scope.bag.provider.eventDrag.call(pr2, pr2, marker);
                            });
                            var datum = pr2.toString.call(pr2, pr2.$scope.model.value.position.datum, pr2.$scope.bag.position.precision);
                            if (typeof datum !== 'boolean') {
                                pr2.$scope.bag.position.datumText = datum;
                                pr2.$scope.bag.position.datumStyle = {};
                            } else {
                                pr2.$scope.bag.position.datumStyle = { 'color': 'red' };
                            }
                            pr2.$scope.$apply();
                        }  else {
                            var element = document.getElementById(pr2.div);
                            if (element == null) {
                                event.cancel(pr2.$scope.identifier);
                                delete pr2.$scope.bag.provider.gmap;
                                delete pr2;
                                return;
                            }
                            var newValue = element.offsetTop;
                            var newSize = element.clientHeight * element.clientWidth;
                            if (newValue != 0 && pr2.$scope.bag.provider.showMap == false) {
                                //  Was hidden, now being shown
                                pr2.$scope.bag.provider.showMap = true;
                                pr2.$timeout(function () {
                                    pr2.$scope.bag.provider.eventRefresh.call(pr2);
                                });
                                pr2.$scope.$apply();
                            } else if (newValue == 0 && pr2.$scope.bag.provider.showMap == true) {
                                //  Was shown, now being hidden
                                pr2.$scope.bag.provider.showMap = false;
                                pr2.$scope.$apply();
                            }
                            else if (pr2.$scope.bag.provider.showMap == true && pr2.divoldsize != 0 && newSize != 0 && pr2.divoldsize != newSize) {
                                pr2.$timeout(pr2.$scope.bag.provider.eventCheckRefresh);
                            }
                            pr2.divoldsize = newSize;
                        }
                    });

                    if (gm.status != gm.subsystemCooloff && gm.status != gm.subsystemCompleted) {
                        if (gm.status == gm.subsystemUninitiated) {
                            gm.createSubsystem(pr.$scope.model.value.provider.apiKey, pr.$scope.model.value.provider.forceHttps,
                                pr.$scope.model.value.position.id, pr.$scope.model.value.provider.language);
                        }

                        count = 0;
                        var superWaiter = setInterval(function () {
                            if (gm.status != gm.subsystemCooloff && gm.status != gm.subsystemCompleted) {
                                //  Error with subsystem, it isn't loading, only thing we can do is try again
                                if (count > 5) {
                                    pr.$scope.bag.provider.statusError = true;
                                    clearInterval(superWaiter);
                                }

                                gm.createSubsystem(pr.$scope.model.value.provider.apiKey, pr.$scope.model.value.provider.forceHttps,
                                    pr.$scope.model.value.position.id, pr.$scope.model.value.provider.language);
                                count++;
                            } else {
                                clearInterval(superWaiter);
                            }
                        }, gm.timeout);
                    } 
                }, gm.poll);
            }
        },
        eventZoom: function (pr2) {
            if (pr2.$scope.bag.provider.ignoreEvents > 0) {
                return;
            }
            gm.originalConsole.warn(pr2.$scope.identifier + ': eventZoom()');
            pr2.$scope.model.value.zoom = pr2.$scope.bag.provider.gmap.getZoom();
        },
        eventRefresh: function (pr2) {
            if (pr2.$scope.bag.provider.ignoreEvents > 0) {
                return;
            }
            gm.originalConsole.warn(pr2.$scope.identifier + ': eventRefresh()');
            pr2.$scope.bag.provider.ignoreEvents++;
            pr2.$scope.bag.provider.gmap.setZoom(pr2.$scope.model.value.zoom);
            var latlng = new google.maps.LatLng(pr2.$scope.model.value.position.datum.latitude, pr2.$scope.model.value.position.datum.longitude);
            pr2.$scope.bag.provider.gmarker.setPosition(latlng);
            pr2.$scope.bag.provider.gmap.panTo(latlng);
            google.maps.event.trigger(pr2.$scope.bag.provider.gmap, 'resize');
            pr2.$scope.bag.provider.ignoreEvents--;
        },
        eventCheckRefresh: function (pr2) {
            if (!pr2.$scope.bag.provider.gmap.getBounds().contains(pr2.$scope.bag.provider.gmarker.getPosition())) {
                pr2.eventRefresh.call(pr2);
            }
        },
        eventDrag: function (pr2, marker) {
            if (pr2.$scope.bag.provider.ignoreEvents > 0) {
                return;
            }
            gm.originalConsole.warn(pr2.$scope.identifier + ': eventDrag()');
            pr2.$scope.bag.provider.ignoreEvents++;
            pr2.$scope.model.value.position.datum = {
                latitude: marker.latLng.lat(),
                longitude: marker.latLng.lng()
            };
            pr2.datumChange.call(pr2, pr2, pr2.$scope.model.value.position.datum);
            pr2.$scope.bag.provider.ignoreEvents--;
        }
    };

    root.terratypeProvider['GoogleMapsV3'] = pr;
}(window));
