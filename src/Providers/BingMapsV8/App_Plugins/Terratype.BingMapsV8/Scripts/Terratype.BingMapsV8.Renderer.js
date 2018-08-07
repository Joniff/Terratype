(function (root) {

	var isBingReady = false;
	var allowBingToHandleResizes = true;

	var q = {
		id: 'Terratype.BingMapsV8',
		maps: [],
		_defaultProvider: {
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
		_loadMap: function (model, match) {
			return {
				_provider: root.terratype._mergeJson(q._defaultProvider, model.provider),
				_center: null,
				_height: model.height,
				_maxLat: -360.0,
				_maxLng: -360.0,
				_minLat: 360,
				_minLng: 360,
				_maxIconSize: 0,
			};
		},
		_needTraffic: false,
		_trafficLoaded: false,
		_loadMarker: function (m, model, match) {
			if (model.position) {
				var datum = root.terratype._parseLatLng(model.position.datum);
				var latlng = new root.Microsoft.Maps.Location(datum.latitude, datum.longitude);
				if (m._center == null) {
					m._center = latlng;
				}
				if (model.icon && model.icon.url) {
					m.positions.push({
						id: id,
						tag: match.getAttribute('data-tag'),
						label: match.getAttribute('data-label-id'),
						position: model.position,
						_latlng: latlng,
						_icon: model.icon.url,
						_anchor: new root.Microsoft.Maps.Point(
							root.terratype._getAnchorHorizontal(model.icon.anchor.horizontal, model.icon.size.width),
							root.terratype._getAnchorVertical(model.icon.anchor.vertical, model.icon.size.height)),
						autoShowLabel: match.getAttribute('data-auto-show-label') ? true : false
					});
					if (latlng.latitude > m._maxLat) {
						m._maxLat = latlng.latitude;
					}
					if (latlng.latitude < m._minLat) {
						m._minLat = latlng.latitude;
					}
					if (latlng.longitude > m._maxLng) {
						m._maxLng = latlng.longitude;
					}
					if (latlng.longitude < m._minLng) {
						m._minLng = latlng.longitude;
					}
					if (model.icon.size.width > m._maxIconSize) {
						m._maxIconSize = model.icon.size.width;
					}
					if (model.icon.size.height > m._maxIconSize) {
						m._maxIconSize = model.icon.size.height;
					}
				}
			}
			if (model.provider.traffic.enable == true && q._needTraffic == false) {
				q._needTraffic = true;
				root.Microsoft.Maps.loadModule('Microsoft.Maps.Traffic', function () { q._trafficLoaded = true; });
			}
		},
		_prerender: function () {
			return q._needTraffic == q._trafficLoaded;
		},
		_mapTypeIds: function (basic, satellite, streetView, style) {
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
		_log2: Math.log(2),
		_calculateZoom: function (m) {
			var el = document.getElementById(m._div);
			if (el.clientWidth <= 0 || el.clientHeight <= 0) {
				return 1;
			}
			var buffer = m._maxIconSize * 2;
			var zoomWidth = Math.log(1.40625 * (el.clientWidth - buffer) / m._bound.width) / q._log2;
			var zoomHeight = Math.log(0.703125 * (el.clientHeight - buffer) / m._bound.height) / q._log2;

			return (zoomHeight < zoomWidth) ? zoomHeight : zoomWidth;
		},
		_render: function (m) {
			m._ignoreEvents = 0;
			var mapTypeIds = q._mapTypeIds(m._provider.variety.basic, m._provider.variety.satellite, m._provider.variety.streetView, m._provider.predefineStyling);
			m._bound = new Microsoft.Maps.LocationRect.fromEdges(m._maxLat, m._minLng, m._minLat, m._maxLng);
			if (m.autoFit) {
				m._center = m._bound.center;
			}
			m.handle = new root.Microsoft.Maps.Map(document.getElementById(m._div), {
				credentials: m._provider.apiKey,
				enableSearchLogo: false,
				showBreadcrumb: m._provider.breadcrumb.enable,
				showCopyright: false,
				showDashboard: m._provider.dashboard.enable,
				showMapTypeSelector: mapTypeIds.length > 1,
				showScalebar: m._provider.scale.enable,
				disableBirdseye: !m._provider.variety.satellite,
				disableScrollWheelZoom: true,
				labelOverlay: m._provider.showLabels ? root.Microsoft.Maps.LabelOverlay.visible : root.Microsoft.Maps.LabelOverlay.hidden,
				allowHidingLabelsOfRoad: !m._provider.showLabels,
				showMapLabels: m._provider.showLabels,
				mapTypeId: mapTypeIds[0],
				fixedMapPosition: allowBingToHandleResizes,
				height: m._height
			});
			m.handle.setView({
				center: m._center,
				zoom: m.autoFit ? q._calculateZoom(m) : m.zoom,
				mapTypeId: mapTypeIds[0],
				labelOverlay: m._provider.showLabels ? root.Microsoft.Maps.LabelOverlay.visible : root.Microsoft.Maps.LabelOverlay.hidden,
			});
			if (m._provider.traffic.enable == true) {
				m._traffic = new root.Microsoft.Maps.Traffic.TrafficManager(m.handle);
				m._traffic.show();
				if (m._provider.traffic.legend) {
					m._traffic.showLegend();
				} else {
					m._traffic.hideLegend();
				}
			}

			root.Microsoft.Maps.Events.addHandler(m.handle, 'viewchangeend', function () {
				if (m._ignoreEvents > 0) {
					return;
				}
				var zoom = m.handle.getZoom();
				if (zoom != m.zoom) {
					m.zoom = zoom;
					root.terratype._callZoom(q, m, m.zoom);
					q.closeInfoWindows(m);
				}
			});
			root.Microsoft.Maps.Events.addHandler(m.handle, 'click', function () {
				if (m._ignoreEvents > 0) {
					return;
				}
				q.closeInfoWindows(m);
			});
			var markers = [];
			root.terratype._forEach(m.positions, function (p, item) {
				item.handle = new root.Microsoft.Maps.Pushpin(item._latlng, {
					id: item.id,
					draggable: false,
					icon: item._icon,
					anchor: item._anchor
				});

				if (document.getElementById(item.label) != null) {
					item._info = new root.Microsoft.Maps.Infobox(item._latlng, {
						description: ' ',
						visible: false,
						pushpin: item.handle
					});
					item._info._options.description = document.getElementById(item.label).innerHTML;
					item._info.setMap(m.handle);
					root.Microsoft.Maps.Events.addHandler(item.handle, 'click', function () {
						if (m._ignoreEvents > 0) {
							return;
						}
						q.closeInfoWindows(m);
						if (item._info) {
							q.openInfoWindow(m, p);
						}
					});
					if (root.terratype._domDetectionType == 2 && item.autoShowLabel) {
						root.setTimeout(function () {
							q.openInfoWindow(m, p);
						}, 100);
					}
				} else {
					root.Microsoft.Maps.Events.addHandler(item.handle, 'click', function () {
						root.terratype._callClick(q, m, item);
					});
				}
				markers.push(item.handle);
			});

			if (m.positions.length > 1) {
				m._clusterLayer = new root.Microsoft.Maps.ClusterLayer(markers);
				m.handle.layers.insert(m._clusterLayer);
			} else {
				m.handle.entities.push(m.positions[0].handle);
			}
		},
		openInfoWindow: function (m, p) {
			var item = m.positions[p];
			item._info.setOptions({
				visible: true
			});
			root.terratype._callClick(q, m, item);
		},
		closeInfoWindows: function (m) {
			root.terratype._forEach(m.positions, function (p, item) {
				if (item._info != null && item._info.getVisible()) {
					item._info.setOptions({
						visible: false
					});
				}
			});
		},
		_checkResize: function (m) {
			if (!m.handle.getBounds().contains(m._center)) {
				q.refresh(m);
			}
		},
		refresh: function (m) {
			if (m._ignoreEvents > 0) {
				return;
			}
			m._ignoreEvents++;
			if (!allowBingToHandleResizes) {
				m.handle.setView({
					zoom: m.zoom
				});
				var mapId = m.handle.getMapTypeId();
				var mapTypeIds = q._mapTypeIds(m._provider.variety.basic, m._provider.variety.satellite, m._provider.variety.streetView, m._provider.predefineStyling);
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
				m.handle.setMapType(Microsoft.Maps.MapTypeId.mercator);
			}
			setTimeout(function () {
				if (!allowBingToHandleResizes) {
					m.handle.setMapType(mapId);
				}
				m._ignoreEvents--;

				if (m._refreshes == 0) {
					root.terratype._forEach(m.positions, function (p, item) {
						if (item.autoShowLabel) {
							root.setTimeout(function () {
								q.openInfoWindow(m, p);
							}, 100);
						}
					});
				}

				if (m._refreshes == 0 || m.recenterAfterRefresh) {
					m.handle.setView({
						center: m._center,
						zoom: m.autoFit ? q._calculateZoom(m) : m.zoom
					});
				}

				if (m._refreshes++ == 0) {
					root.terratype._opacityShow(m);
					root.terratype._callRender(q, m);
				} else {
					root.terratype._callRefresh(q, m);
				}
			}, 1)
		},
	};

	if (root.terratype && root.terratype._addProvider) {
		root.terratype._addProvider(q.id, q);
	} else {
		var timer = root.setInterval(function () {
			if (root.terratype && root.terratype._addProvider) {
				root.terratype._addProvider(q.id, q);
				root.clearInterval(timer);
			}
		}, 100);
	}

	root.TerratypeBingMapsV8CallbackRender = function () {
		root.Microsoft.Maps.loadModule("Microsoft.Maps.Clustering", function () {
			isBingReady = true;
        });
    }
}(window));


