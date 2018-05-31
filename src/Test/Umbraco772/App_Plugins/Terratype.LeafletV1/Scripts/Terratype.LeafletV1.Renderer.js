(function (root) {
	var q = {
		id: 'Terratype.LeafletV1',
		maps: [],
		_defaultProvider: {
			layers: [{
				maxZoom: 18,
				id: 'OpenStreetMap.Mapnik'
			}],
			zoomControl: {
				enable: true,
				position: 1
			}
		},
		ready: function () {
			return (L && L.MarkerClusterGroup && root.terratype && root.terratype.providers && typeof
				root.terratype.providers[q.id] !== 'undefined' && typeof root.terratype.providers[q.id].tileServers !== 'undefined');
		},
		_loadMap: function (model, match) {
			return {
				_provider: (q._defaultProvider) ?
					root.terratype._mergeJson(q._defaultProvider, model.provider) :
					model.provider,
				_minZoom: null,
				_maxZoom: null,
				_layers: null,
				_bound: new L.latLngBounds(),
				_center: null
			};
		},
		_loadCss: false,
		_loadMarker: function (m, model, match) {
			if (m._layers == null && model.provider.mapSources && model.provider.mapSources.length != 0) {
				m._layers = [];
				for (var g = 0; g != model.provider.mapSources.length; g++) {
					var p = root.terratype.providers[q.id];
					for (var j = 0; j != p.tileServers.length; j++) {
						for (var k = 0; k != p.tileServers[j].tileServers.length; k++) {
							var ts = p.tileServers[j].tileServers[k];
							if (ts.id == model.provider.mapSources[g].tileServer.id) {
								var options = JSON.parse(JSON.stringify(ts.options));
								options.minZoom = ts.minZoom;
								options.maxZoom = ts.maxZoom;
								options.attribution = ts.attribution,
								options.key = model.provider.mapSources[g].key
								m._layers.push(L.tileLayer(ts.url, options));
								if (m._minZoom == null || ts.minZoom < m._minZoom) {
									m._minZoom = ts.minZoom;
								}
								if (m._maxZoom == null || ts.maxZoom > m._minZoom) {
									m._maxZoom = ts.maxZoom;
								}
							}
						}
					}
				}
			}

			if (model.position) {
				var datum = root.terratype._parseLatLng(model.position.datum);
				var latlng = new L.latLng(datum.latitude, datum.longitude);
				if (m._center == null) {
					m._center = latlng;
				}
				if (model.icon && model.icon.url) {
					m._bound.extend(latlng);
					var anchor = [root.terratype._getAnchorHorizontal(model.icon.anchor.horizontal, model.icon.size.width),
					root.terratype._getAnchorVertical(model.icon.anchor.vertical, model.icon.size.height)];
					m.positions.push({
						id: id,
						tag: match.getAttribute('data-tag'),
						label: match.getAttribute('data-label-id'),
						position: model.position,
						_latlng: latlng,
						_icon: L.icon({
							iconUrl: root.terratype._configIconUrl(model.icon.url),
							iconSize: [model.icon.size.width, model.icon.size.height],
							iconAnchor: anchor,
							popupAnchor: [anchor[0] - (model.icon.size.width / 2), -anchor[1]]
						}),
						autoShowLabel: match.getAttribute('data-auto-show-label') ? true : false
					});
				}
			}
			if (root.terratype.providers[q.id]._loadCss == false) {
				root.terratype._loadCss(JSON.parse(unescape(match.getAttribute('data-css-files'))));
				root.terratype.providers[q.id]._loadCss = true;
			}
		},
		_render: function (m) {
			m._ignoreEvents = 0;
			if (m.autoFit) {
				m._center = m._bound.getCenter();
			}
			m.handle = L.map(document.getElementById(m._div), {
				center: m._center,
				zoom: m.zoom,
				minZoom: m._minZoom,
				maxZoom: m._maxZoom,
				layers: m._layers,
				scrollWheelZoom: false,
				attributionControl: false,
				zoomControl: false
			});
			m._zoomControl = null;
			if (m._provider.zoomControl.enable) {
				m._zoomControl = L.control.zoom({
					position: q._controlPosition(m._provider.zoomControl.position)
				}).addTo(m.handle);
			}
			m.handle.on('zoomend', function () {
				if (m._ignoreEvents > 0) {
					return;
				}
				m.zoom = m.handle.getZoom();
				root.terratype._callZoom(q, m, m.zoom);
			});
			m.handle.on('load', function () {
				if (m._ignoreEvents > 0) {
					return;
				}
				var el = document.getElementById(m._div);
				if (root.terratype._isElementInViewport(el) && el.clientHeight != 0 && el.clientWidth != 0) {
					q.refresh(m);
				}
			});
			m.handle.on('resize', function () {
				if (m._ignoreEvents > 0) {
					return;
				}
				q.refresh(m);
			});
			m.handle.on('click', function () {
				q.closeInfoWindows(m);
			});
			m._cluster = m.positions.length > 1 ? L.markerClusterGroup({ chunkedLoading: m.positions.length > 100, zoomToBoundsOnClick: true }) : null;

			m._featureGroup = L.featureGroup().addTo(m.handle).on('click', function (e) {
				q.openInfoWindow(m, e.layer.options.index);
			});

			root.terratype._forEach(m.positions, function (p, item) {
				item.handle = L.marker(item._latlng, {
					index: p,
					draggable: false,
					id: 'terratype_' + item.id + '_marker',
					icon: item._icon
				});
				item._info = null;
				if (item.label) {
					var l = document.getElementById(item.label);
					if (l) {
						item._info = item.handle.addTo(m._featureGroup).bindPopup(l.innerHTML);
						if (root.terratype._domDetectionType == 2 && item.autoShowLabel) {
							root.setTimeout(function () {
								q.openInfoWindow(m, p);
							}, 100);
						}
					}
				}
				if (m._cluster != null) {
					m._cluster.addLayer(item.handle);
				} else {
					item.handle.addTo(m.handle);
				}
				item.handle.on('click', function (e) { root.terratype._callClick(q, m, item); });
			});

			if (m._cluster != null) {
				m.handle.addLayer(m._cluster);
			}
		},
		_controlPosition: function (i) {
			switch (parseInt(i)) {
				case 1:
					return 'topleft';
				case 3:
					return 'topright';
				case 10:
					return 'bottomleft';
				case 12:
					return 'bottomright';
			}
			return 'topleft';
		},
		openInfoWindow: function (m, p) {
			var item = m.positions[p];
			item._info.openPopup();
			root.terratype._callClick(q, m, item);
		},
		closeInfoWindows: function (m) {
			m.handle.closePopup();
		},
		_checkResize: function (m) {
			if (!m.handle.getBounds().contains(m._center)) {
				q.refresh(m);
			}
		},
		_reset: function (m) {
			if (m._refreshes == 0) {
				root.terratype._forEach(m.positions, function (p, item) {
					if (item.autoShowLabel) {
						root.setTimeout(function () {
							q.openInfoWindow(m, p);
						}, 100);
					}
				});
				m._status = 2;
			}
			if (m._refreshes == 0 || m.recenterAfterRefresh) {
				if (m.autoFit) {
					m.handle.setZoom(m._maxZoom);
					var bound = new L.latLngBounds(m._bound.getNorthEast(), m._bound.getSouthWest());
					m.handle.fitBounds(bound);
				}
				m.zoom = m.handle.getZoom();
				m.handle.setView(m._center, m.zoom);
			}

			if (m._refreshes++ == 0) {
				root.terratype._opacityShow(m);
				root.terratype._callRender(q, m);
			} else {
				root.terratype._callRefresh(q, m);
			}
		},
		refresh: function (m) {
			m._ignoreEvents++;
			if (m.recenterAfterRefresh) {
				m.handle.setZoom(m.zoom);
				m.handle.setView(m._center);
			}
			m.handle.invalidateSize();
			setTimeout(function () {
				if (m._cluster != null) {
					m._cluster.refreshClusters();
				}
				q._reset(m);
				m._ignoreEvents--;
			}, 1);
		}
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
}(window));


