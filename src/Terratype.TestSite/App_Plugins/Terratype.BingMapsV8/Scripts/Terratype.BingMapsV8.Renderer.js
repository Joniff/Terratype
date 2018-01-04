(function (root) {

	var isBingReady = false;
	var allowBingToHandleResizes = true;

	var q = {
		id: 'Terratype.BingMapsV8',
		maps: [],
		defaultProvider: {
			position: {
				datum: "55.4063207,10.3870147"
			},
			zoom: 12,
			provider: {
				version: 'release',
				forceHttps: true,
				language: '',
				predefineStyling: 'road',
				showLabels: true,
				variety: {
					basic: true,
					satellite: false,
					streetView: false
				},
				scale: {
					enable: true
				},
				breadcrumb: {
					enable: true
				},
				dashboard: {
					enable: true
				},
				traffic: {
					enable: false,
					legend: false
				}
			},
			search: {
				enable: 0,
			}
		},
		ready: function () {
			return isBingReady;
		},
		loadMap: function (model, match) {
			return {
				zoom: model.zoom,
				provider: root.terratype.mergeJson(q.defaultProvider, model.provider),
				positions: [],
				height: model.height,
				maxLat: -360.0,
				maxLng: -360.0,
				minLat: 360,
				minLng: 360,
				maxIconSize: 0,
			};
		},
		needTraffic: false,
		trafficLoaded: false,
		loadMarker: function (m, model, match) {
			if (model.icon && model.icon.url) {
				var datum = root.terratype.parseLatLng(model.position.datum);
				var latlng = new root.Microsoft.Maps.Location(datum.latitude, datum.longitude);
				m.positions.push({
					id: id,
					label: match.getAttribute('data-label-id'),
					latlng: latlng,
					icon: model.icon.url,
					anchor: new root.Microsoft.Maps.Point(
						root.terratype.getAnchorHorizontal(model.icon.anchor.horizontal, model.icon.size.width),
						root.terratype.getAnchorVertical(model.icon.anchor.vertical, model.icon.size.height)),
					autoShowLabel: match.getAttribute('data-auto-show-label')
				});
				if (latlng.latitude > m.maxLat) {
					m.maxLat = latlng.latitude;
				}
				if (latlng.latitude < m.minLat) {
					m.minLat = latlng.latitude;
				}
				if (latlng.longitude > m.maxLng) {
					m.maxLng = latlng.longitude;
				}
				if (latlng.longitude < m.minLng) {
					m.minLng = latlng.longitude;
				}
				if (model.icon.size.width > m.maxIconSize) {
					m.maxIconSize = model.icon.size.width;
				}
				if (model.icon.size.height > m.maxIconSize) {
					m.maxIconSize = model.icon.size.height;
				}
			}
			if (model.provider.traffic.enable == true && q.needTraffic == false) {
				q.needTraffic = true;
				root.Microsoft.Maps.loadModule('Microsoft.Maps.Traffic', function () { q.trafficLoaded = true; });
			}
		},
		prerender: function () {
			return q.needTraffic == q.trafficLoaded;
		},
		mapTypeIds: function (basic, satellite, streetView, style) {
			var mapTypeIds = [];
			if (basic) {
				if (style != '') {
					mapTypeIds.push(root.Microsoft.Maps.MapTypeId[style]);
				} else {
					mapTypeIds.push(root.Microsoft.Maps.MapTypeId.road);
				}
			}
			if (satellite) {
				mapTypeIds.push(root.Microsoft.Maps.MapTypeId.aerial);
			}
			if (streetView) {
				mapTypeIds.push(root.Microsoft.Maps.MapTypeId.streetside);
			}
			if (mapTypeIds.length == 0) {
				mapTypeIds.push(root.Microsoft.Maps.MapTypeId.road);
			}

			return mapTypeIds;
		},
		render: function (m) {
			if (allowBingToHandleResizes) {
				q.domDetectionType = 2;
			}
			m.ignoreEvents = 0;
			var mapTypeIds = q.mapTypeIds(m.provider.variety.basic, m.provider.variety.satellite, m.provider.variety.streetView, m.provider.predefineStyling);
			m.bound = new Microsoft.Maps.LocationRect.fromEdges(m.maxLat, m.minLng, m.minLat, m.maxLng);
			m.center = (m.autoFit) ? m.bound.center : m.positions[0].latlng;
			m.gmap = new root.Microsoft.Maps.Map(document.getElementById(m.div), {
				credentials: m.provider.apiKey,
				enableSearchLogo: false,
				showBreadcrumb: m.provider.breadcrumb.enable,
				showCopyright: false,
				showDashboard: m.provider.dashboard.enable,
				showMapTypeSelector: mapTypeIds.length > 1,
				showScalebar: m.provider.scale.enable,
				disableBirdseye: !m.provider.variety.satellite,
				disableScrollWheelZoom: true,
				labelOverlay: m.provider.showLabels ? root.Microsoft.Maps.LabelOverlay.visible : root.Microsoft.Maps.LabelOverlay.hidden,
				allowHidingLabelsOfRoad: !m.provider.showLabels,
				showMapLabels: m.provider.showLabels,
				mapTypeId: mapTypeIds[0],
				fixedMapPosition: allowBingToHandleResizes,
				height: m.height
			});
			var view = {
				mapTypeId: mapTypeIds[0],
				labelOverlay: m.provider.showLabels ? root.Microsoft.Maps.LabelOverlay.visible : root.Microsoft.Maps.LabelOverlay.hidden,
			}
			if (m.autoFit) {
				view.bounds = m.bound;
			} else {
				view.center = m.center;
				view.zoom = m.zoom;
			}
			m.gmap.setView(view);
			if (m.provider.traffic.enable == true) {
				m.traffic = new root.Microsoft.Maps.Traffic.TrafficManager(m.gmap);
				m.traffic.show();
				if (m.provider.traffic.legend) {
					m.traffic.showLegend();
				} else {
					m.traffic.hideLegend();
				}
			}

			root.Microsoft.Maps.Events.addHandler(m.gmap, 'viewchangeend', function () {
				if (m.ignoreEvents > 0) {
					return;
				}
				m.zoom = m.gmap.getZoom();
				q.closeInfoWindows(m);
			});
			root.Microsoft.Maps.Events.addHandler(m.gmap, 'click', function () {
				if (m.ignoreEvents > 0) {
					return;
				}
				q.closeInfoWindows(m);
			});
			m.ginfos = [];
			m.gmarkers = [];
			root.terratype.forEach(m.positions, function (p, item) {
				m.gmarkers[p] = new root.Microsoft.Maps.Pushpin(item.latlng, {
					id: item.id,
					draggable: false,
					icon: item.icon,
					anchor: item.anchor
				});

				m.ginfos[p] = null;
				if (document.getElementById(item.label) != null) {
					m.ginfos[p] = new root.Microsoft.Maps.Infobox(item.latlng, {
						description: ' ',
						visible: false,
						pushpin: m.gmarkers[p]
					});
					m.ginfos[p]._options.description = document.getElementById(item.label).innerHTML;
					m.ginfos[p].setMap(m.gmap);
					root.Microsoft.Maps.Events.addHandler(m.gmarkers[p], 'click', function () {
						if (m.ignoreEvents > 0) {
							return;
						}
						q.closeInfoWindows(m);
						if (m.ginfos[p]) {
							q.openInfoWindow(m, p);
						}
					});
				}

				if (item.autoShowLabel) {
					root.setTimeout(function () {
						q.openInfoWindow(m, p);
					}, 100);
				}
			});

			if (m.positions.length > 1) {
				m.clusterLayer = new root.Microsoft.Maps.ClusterLayer(m.gmarkers);
				m.gmap.layers.insert(m.clusterLayer);
			} else {
				m.gmap.entities.push(m.gmarkers[0]);
			}
			m.status = 1;
		},
		openInfoWindow: function (m, p) {
			m.ginfos[p].setOptions({
				visible: true
			});
			root.terratype.callClick(q, m, p);
		},
		closeInfoWindows: function (m) {
			root.terratype.forEach(m.positions, function (p, item) {
				if (m.ginfos[p] != null && m.ginfos[p].getVisible()) {
					m.ginfos[p].setOptions({
						visible: false
					});
				}
			});
		},
		checkResize: function (m) {
			if (!m.gmap.getBounds().contains(m.center)) {
				q.refresh(m);
			}
		},
		refresh: function (m) {
			if (m.ignoreEvents > 0) {
				return;
			}
			m.ignoreEvents++;
			var o = {
				zoom: m.zoom
			};
			if (m.recenterAfterRefresh) {
				o.center = m.center;
			}
			m.gmap.setView(o);
			var mapId = m.gmap.getMapTypeId();
			var mapTypeIds = q.mapTypeIds(m.provider.variety.basic, m.provider.variety.satellite, m.provider.variety.streetView, m.provider.predefineStyling);
			var found = false;
			for (var i = 0; i != mapTypeIds.length; i++) {
				if (mapTypeIds[i] == mapId) {
					found = true;
					break;
				}
			}
			if (found == false) {
				mapId = mapTypeIds[0];
			}
			m.gmap.setMapType(Microsoft.Maps.MapTypeId.mercator);
			setTimeout(function () {
				m.gmap.setMapType(mapId);
				m.ignoreEvents--;

				if (m.refreshes++ == 0) {
					root.terratype.callRender(q, m);
				} else {
					root.terratype.callRefresh(q, m);
				}
			}, 1)
		},
	};

	var timer = root.setInterval(function () {
		if (root.terratype && root.terratype.addProvider) {
			root.terratype.addProvider(q.id, q);
			root.clearInterval(timer);
		}
	}, 250);

	root.TerratypeBingMapsV8CallbackRender = function () {
		root.Microsoft.Maps.loadModule("Microsoft.Maps.Clustering", function () {
			isBingReady = true;
        });
    }
}(window));


