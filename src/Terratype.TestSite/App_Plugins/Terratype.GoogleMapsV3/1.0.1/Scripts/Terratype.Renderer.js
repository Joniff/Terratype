(function (root) {
    var q = {
        poll: 100,
        markerClustererUrl: document.getElementsByClassName('Terratype.GoogleMapsV3')[0].getAttribute('data-markerclusterer-url'),
        maps: [],
        mapTypeIds: function (basic, satellite, terrain) {
            var mapTypeIds = [];
            if (basic) {
                mapTypeIds.push('roadmap');
            }
            if (satellite) {
                mapTypeIds.push('satellite');
            }
            if (terrain) {
                mapTypeIds.push('terrain');
            }

            if (mapTypeIds.length == 0) {
                mapTypeIds.push('roadmap');
            }
            return mapTypeIds;
        },
        init: function () {
            q.load();
            q.updateJs();   //  Can be changed for q.updateJquery(), if *all* DOM updates happen via jQuery (and obviously jQuery is loaded). Have switched off to stop erroneous bug reports
        },
        updateJs: function () {
            //  Use standard JS to monitor page resizes, dom changes, scrolling
            var counter = 0;
            var mapsRunning = 0;
            var timer = setInterval(function () {
                if (counter == q.maps.length) {
                    if (mapsRunning == 0) {
                        //  There are no maps running
                        clearInterval(timer);
                    }
                    counter = 0;
                    mapsRunning = 0;
                }
                var m = q.maps[counter];
                if (m.status != -1 && m.positions.length != 0) {
                    mapsRunning++;
                    if (m.status == 0) {
                        q.render(m);
                    } else {
                        q.idle(m);
                    }
                }
                counter++;
            }, q.poll);
        },
        updateJquery: function () {
            //  Can only be used, if all DOM updates happen via jQuery.
            var counter = 0;
            var timer = setInterval(function () {
                if (counter == q.maps.length) {
                    clearInterval(timer);
                    jQuery(window).on('DOMContentLoaded load resize scroll touchend', function () {
                        counter = 0;
                        var timer2 = setInterval(function () {
                            if (counter == q.maps.length) {
                                clearInterval(timer2);
                            } else {
                                var m = q.maps[counter];
                                if (m.status > 0 && m.positions.length != 0) {
                                    q.idle(m);
                                }
                                counter++;
                            }
                        }, q.poll);
                    });
                } else {
                    var m = q.maps[counter];
                    if (m.status == 0 && m.positions.length != 0) {
                        q.render(m);
                    }
                    counter++;
                }
            }, q.poll);
        },
        getMap: function (mapId) {
            for (var i = 0; i != q.maps.length; i++) {
                if (q.maps[i].id == mapId) {
                    return q.maps[i];
                }
            }
            return null;
        },
        defaultProvider: {
            predefineStyling: 'retro',
            showRoads: true,
            showLandmarks: true,
            showLabels: true,
            variety: {
                basic: true,
                satellite: false,
                terrain: false,
                selector: {
                    type: 1,     // Horizontal Bar
                    position: 0  // Default
                }
            },
            streetView: {
                enable: false,
                position: 0
            },
            fullscreen: {
                enable: false,
                position: 0
            },
            scale: {
                enable: false,
                position: 0
            },
            zoomControl: {
                enable: true,
                position: 0,
            },
            panControl: {
                enable: false
            },
            draggable: true
        },
        mergeJson: function (a, b) {        //  Does not merge arrays
            var mergy = function (c) {
                var t = {};
                for (var k in c) {
                    if (typeof c[k] === 'object' && c[k].constructor.name !== "Array") {
                        t[k] = mergy(c[k]);
                    } else {
                        t[k] = c[k];
                    }
                }
                return t;
            }
            var r = (a) ? mergy(a) : {};
            if (b) {
                for (var k in b) {
                    if (r[k] && typeof r[k] === 'object' && r[k].constructor.name !== "Array") {
                        r[k] = q.mergeJson(r[k], b[k]);
                    } else {
                        r[k] = b[k];
                    }
                }
            }
            return r;
        },
        load: function () {
            var matches = document.getElementsByClassName('Terratype.GoogleMapsV3');
            for (var i = 0; i != matches.length; i++) {
                mapId = matches[i].getAttribute('data-map-id');
                id = matches[i].getAttribute('data-id');
                var model = JSON.parse(unescape(matches[i].getAttribute('data-googlemapsv3')));
                var datum = q.parse(model.position.datum);
                var latlng = new root.google.maps.LatLng(datum.latitude, datum.longitude);
                var m = q.getMap(mapId);
                if (m == null) {
                    m = {
                        id: mapId,
                        div: id,
                        zoom: model.zoom,
                        provider: q.mergeJson(q.defaultProvider, model.provider),
                        positions: [],
                        center: latlng,
                        divoldsize: 0,
                        status: 0,
                        visible: false
                    };
                    matches[i].style.display = 'block';
                    q.maps.push(m);
                }
                if (model.icon && model.icon.url) {
                    m.positions.push({
                        id: id,
                        label: matches[i].getAttribute('data-label-id'),
                        latlng: latlng,
                        icon: {
                            url: q.configIconUrl(model.icon.url),
                            scaledSize: new root.google.maps.Size(model.icon.size.width, model.icon.size.height),
                            anchor: new root.google.maps.Point(
                                q.getAnchorHorizontal(model.icon.anchor.horizontal, model.icon.size.width),
                                q.getAnchorVertical(model.icon.anchor.vertical, model.icon.size.height))
                        }
                    });
                }
            }
        },
        render: function (m) {
            m.ignoreEvents = 0;
            var mapTypeIds = q.mapTypeIds(m.provider.variety.basic, m.provider.variety.satellite, m.provider.variety.terrain);
            m.gmap = new root.google.maps.Map(document.getElementById(m.div), {
                disableDefaultUI: false,
                scrollwheel: false,
                panControl: false,      //   Has been depricated
                center: m.center,
                zoom: m.zoom,
                draggable: true,
                fullScreenControl: m.provider.fullscreen.enable,
                fullscreenControlOptions: m.provider.fullscreen.position,
                styles: m.provider.styles,
                mapTypeId: mapTypeIds[0],
                mapTypeControl: (mapTypeIds.length > 1),
                mapTypeControlOptions: {
                    style: m.provider.variety.selector.type,
                    mapTypeIds: mapTypeIds,
                    position: m.provider.variety.selector.position
                },
                scaleControl: m.provider.scale.enable,
                scaleControlOptions: {
                    position: m.provider.scale.position
                },
                streetViewControl: m.provider.streetView.enable,
                streetViewControlOptions: {
                    position: m.provider.streetView.position
                },
                zoomControl: m.provider.zoomControl.enable,
                zoomControlOptions: {
                    position: m.provider.zoomControl.position
                }
            });
            with ({
                mm: m
            }) {
                root.google.maps.event.addListener(mm.gmap, 'zoom_changed', function () {
                    if (mm.ignoreEvents > 0) {
                        return;
                    }
                    q.closeInfoWindows(mm);
                    mm.zoom = mm.gmap.getZoom();
                });
                root.google.maps.event.addListenerOnce(mm.gmap, 'tilesloaded', function () {
                    if (mm.ignoreEvents > 0) {
                        return;
                    }
                    q.refresh(mm);
                    mm.status = 2;
                });
                root.google.maps.event.addListener(mm.gmap, 'resize', function () {
                    if (mm.ignoreEvents > 0) {
                        return;
                    }
                    q.checkResize(mm);
                });
                root.google.maps.event.addListener(mm.gmap, 'click', function () {
                    if (mm.ignoreEvents > 0) {
                        return;
                    }
                    q.closeInfoWindows(mm);
                });
            }
            m.ginfos = [];
            m.gmarkers = [];

            for (var p = 0; p != m.positions.length; p++) {
                var item = m.positions[p];
                m.ginfos[p] = new root.google.maps.InfoWindow({
                    content: document.getElementById(item.label)
                });
                m.gmarkers[p] = new root.google.maps.Marker({
                    map: m.gmap,
                    position: item.latlng,
                    id: item.id,
                    draggable: false,
                    icon: item.icon
                });

                if (document.getElementById(item.label) != null) {
                    with ({
                        mm: m,
                        pp: p
                    }) {
                        mm.gmarkers[p].addListener('click', function () {
                            if (mm.ignoreEvents > 0) {
                                return;
                            }
                            q.closeInfoWindows(mm);

                            mm.ginfos[pp].open(mm.gmap, mm.gmarkers[pp]);
                        });
                    }
                }
            }

            if (m.positions.length > 1) {
                m.markerclusterer = new MarkerClusterer(m.gmap, m.gmarkers, { imagePath: q.markerClustererUrl });
            }
            m.status = 1;
        },
        closeInfoWindows: function (m) {
            for (var p = 0; p != m.positions.length; p++) {
                m.ginfos[p].close();
            }
        },
        checkResize: function (m) {
            if (!m.gmap.getBounds().contains(m.center)) {
                q.refresh(m);
            }
        },
        refresh: function (m) {
            m.ignoreEvents++;
            m.gmap.setZoom(m.zoom);
            q.closeInfoWindows(m);
            m.gmap.panTo(m.center);
            with ({
                mm: m
            }) {
                root.google.maps.event.addListenerOnce(mm.gmap, 'idle', function () {
                    mm.gmap.panTo(mm.center);
                    m.ignoreEvents--;
                });
            }
            root.google.maps.event.trigger(m.gmap, 'resize');
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
        parse: function (text) {
            var args = text.trim().split(',');
            if (args.length < 2) {
                return false;
            }
            var lat = parseFloat(args[0].substring(0, 10));
            if (isNaN(lat) || lat > 90 || lat < -90) {
                return false;
            }
            var lng = parseFloat(args[1].substring(0, 10));
            if (isNaN(lng) || lng > 180 || lng < -180) {
                return false;
            }
            return {
                latitude: lat,
                longitude: lng
            };
        },
        isElementInViewport: function (el) {
            var rect = el.getBoundingClientRect();

            return (
                rect.bottom >= 0 &&
                rect.right >= 0 &&
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.left <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },
        idle: function (m) {
            var element = document.getElementById(m.div);
            var newValue = element.parentElement.offsetTop;
            var newSize = element.clientHeight * element.clientWidth;
            var show = !(element.style.display == 'none');
            var visible = show && q.isElementInViewport(element);
            if (newValue != 0 && show == false) {
                //console.log('A ' + m.id + ': in viewport = ' + visible + ', showing = ' + show);
                //  Was hidden, now being shown
                document.getElementById(m.div).style.display = 'block';
            } else if (newValue == 0 && show == true) {
                //console.log('B ' + m.id + ': in viewport = ' + visible + ', showing = ' + show);
                //  Was shown, now being hidden
                document.getElementById(m.div).style.display = 'none';
                m.visible = false;
            }
            else if (visible == true && m.divoldsize != 0 && newSize != 0 && m.divoldsize != newSize) {
                //console.log('C ' + m.id + ': in viewport = ' + visible + ', showing = ' + show);
                //  showing, just been resized and map is visible
                q.refresh(m);
                m.visible = true;
            } else if (visible == true && m.visible == false) {
                //console.log('D ' + m.id + ': in viewport = ' + visible + ', showing = ' + show);
                //  showing and map just turned visible
                q.refresh(m);
                m.visible = true;
            } else if (visible == false && m.visible == true) {
                //console.log('E ' + m.id + ': in viewport = ' + visible + ', showing = ' + show);
                //  was visible, but now hiding
                m.visible = false;
            }
            m.divoldsize = newSize;
        }
    }

    root.TerratypeGoogleMapsV3CallbackRender = function () {
        q.init();
    }
}(window));


