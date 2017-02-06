(function (root) {
    var q = {
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
                if (m.status != -1) {
                    mapsRunning++;
                    if (m.status == 0) {
                        q.render(m);
                    } else {
                        q.idle(m);
                    }
                }
                counter++;
            }, 250);
        },
        getMap: function (mapId) {
            for (var i = 0; i != q.maps.length; i++) {
                if (q.maps[i].id == mapId) {
                    return q.maps[i];
                }
            }
            return null;
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
                        provider: model.provider,
                        positions: [],
                        center: latlng,
                        divoldsize: 0,
                        status: 0
                    };
                    matches[i].style.display = 'block';
                    q.maps.push(m);
                }
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
                    m.status = 2;
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
            root.google.maps.event.trigger(m.gmap, 'resize');
            setTimeout(function () {
                m.ignoreEvents--;
            }, 1);
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
        idle: function (m) {
            var element = document.getElementById(m.div);
            var newValue = element.parentElement.offsetTop;
            var newSize = element.clientHeight * element.clientWidth;
            var show = !(element.style.display == 'none');
            if (newValue != 0 && show == false) {
                //  Was hidden, now being shown
                document.getElementById(m.div).style.display = 'block';
                setTimeout(function () {
                    if (document.getElementById(m.div).hasChildNodes() == false) {
                        //  Ouch, map has been deleted, best off just killing ourselves off
                        console.log('Terratype Map ' + m.div + ' has been killed due to no map present');
                        mm.status = -1;
                    } else {
                        q.refresh(m);
                    }
                }, 1);
            } else if (newValue == 0 && show == true) {
                //  Was shown, now being hidden
                document.getElementById(m.div).style.display = 'none';
            }
            else if (show == true && m.divoldsize != 0 && newSize != 0 && m.divoldsize != newSize) {
                q.checkResize(m);
            }
            m.divoldsize = newSize;
        }
    }

    root.TerratypeGoogleMapsV3CallbackRender = function () {
        q.init();
    }
}(window));


