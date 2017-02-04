(function (root) {
    root.terratype_gmapsv3 = {
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
            for (var i = 0; i != root.terratype_gmapsv3.maps.length; i++) {
                var map = root.terratype_gmapsv3.maps[i];
                map.ignoreEvents = 0;
                var datum = root.terratype_gmapsv3.parse(map.position.datum);
                var latlng = new root.google.maps.LatLng(datum.latitude, datum.longitude);
                var mapTypeIds = this.mapTypeIds(map.provider.variety.basic, map.provider.variety.satellite, map.provider.variety.terrain);
                map.gmap = new root.google.maps.Map(document.getElementById(map.id), {
                    disableDefaultUI: false,
                    scrollwheel: false,
                    panControl: false,      //   Has been depricated
                    center: latlng,
                    zoom: map.zoom,
                    draggable: true,
                    fullScreenControl: map.provider.fullscreen.enable,
                    fullscreenControlOptions: map.provider.fullscreen.position,
                    styles: map.provider.styles,
                    mapTypeId: mapTypeIds[0],
                    mapTypeControl: (mapTypeIds.length > 1),
                    mapTypeControlOptions: {
                        style: map.provider.variety.selector.type,
                        mapTypeIds: mapTypeIds,
                        position: map.provider.variety.selector.position
                    },
                    scaleControl: map.provider.scale.enable,
                    scaleControlOptions: {
                        position: map.provider.scale.position
                    },
                    streetViewControl: map.provider.streetView.enable,
                    streetViewControlOptions: {
                        position: map.provider.streetView.position
                    },
                    zoomControl: map.provider.zoomControl.enable,
                    zoomControlOptions: {
                        position: map.provider.zoomControl.position
                    }
                });
                root.google.maps.event.addListener(map.gmap, 'zoom_changed', (function(m) { 
                    return function() {
                        if (m.ignoreEvents > 0) {
                            return;
                        }
                        m.zoom = m.gmap.getZoom();
                    }
                })(map));
                root.google.maps.event.addListenerOnce(map.gmap, 'tilesloaded', (function(m) { 
                    return function() {
                        if (m.ignoreEvents > 0) {
                            return;
                        }
                        root.terratype_gmapsv3.refresh(m);
                    }
                })(map));
                root.google.maps.event.addListener(map.gmap, 'resize', (function(m) { 
                    return function() {
                        if (m.ignoreEvents > 0) {
                            return;
                        }
                        if (!m.gmap.getBounds().contains(m.gmarker.getPosition())) {
                            root.terratype_gmapsv3.refresh(m);
                        }
                    }
                })(map));
                map.gmarker = new root.google.maps.Marker({
                    map: map.gmap,
                    position: latlng,
                    id: 'terratype_' + map.id + '_marker',
                    draggable: true,
                    icon: {
                        url: root.terratype_gmapsv3.configIconUrl(map.icon.url),
                        scaledSize: new root.google.maps.Size(map.icon.size.width, map.icon.size.height),
                        anchor: new root.google.maps.Point(map.icon.anchor.horizontal, map.icon.anchor.vertical, icon.size.height)
                    }
                });
            }
        },
        refresh: function (m) {
            m.ignoreEvents++;
            m.gmap.setZoom(m.zoom);
            var latlng = new root.google.maps.LatLng(m.position.datum.latitude, m.position.datum.longitude);
            m.gmarker.setPosition(latlng);
            m.gmap.panTo(latlng);
            root.google.maps.event.trigger(m.gmap, 'resize');
            m.ignoreEvents--;
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

    }
    root.TerratypeGoogleMapsV3CallbackRender = function () {
        root.terratype_gmapsv3.init();
    }
}(window));


