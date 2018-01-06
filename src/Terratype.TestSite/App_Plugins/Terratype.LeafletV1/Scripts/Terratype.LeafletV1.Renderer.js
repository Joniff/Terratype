(function (root) {
	var q = {
		id: 'Terratype.LeafletV1',
		maps: [],
		defaultProvider: {
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
		loadMap: function (model, match) {
			return {
				zoom: model.zoom,
				provider: (q.defaultProvider) ?
					root.terratype.mergeJson(q.defaultProvider, model.provider) :
					model.provider,
				positions: [],
				minZoom: null,
				maxZoom: null,
				layers: null,
				bound: new L.latLngBounds(),
				positions: []
			};
		},
		loadCss: false,
		loadMarker: function (m, model, match) {
			if (m.layers == null && model.provider.mapSources && model.provider.mapSources.length != 0) {
				m.layers = [];
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
								m.layers.push(L.tileLayer(ts.url, options));
								if (m.minZoom == null || ts.minZoom < m.minZoom) {
									m.minZoom = ts.minZoom;
								}
								if (m.maxZoom == null || ts.maxZoom > m.minZoom) {
									m.maxZoom = ts.maxZoom;
								}
							}
						}
					}
				}
			}

			if (model.icon && model.icon.url && model.position) {
				var datum = root.terratype.parseLatLng(model.position.datum);
				var latlng = new L.latLng(datum.latitude, datum.longitude);
				m.bound.extend(latlng);
				var anchor = [root.terratype.getAnchorHorizontal(model.icon.anchor.horizontal, model.icon.size.width),
					root.terratype.getAnchorVertical(model.icon.anchor.vertical, model.icon.size.height)];
				m.positions.push({
					id: id,
					tag: match.getAttribute('data-tag'),
					label: match.getAttribute('data-label-id'),
					latlng: latlng,
					icon: L.icon({
						iconUrl: root.terratype.configIconUrl(model.icon.url),
						iconSize: [model.icon.size.width, model.icon.size.height],
						iconAnchor: anchor,
						popupAnchor: [anchor[0] - (model.icon.size.width / 2), -anchor[1]]
					}),
					autoShowLabel: match.getAttribute('data-auto-show-label')
				});
			}
			if (root.terratype.providers[q.id].loadCss == false) {
				root.terratype.loadCss(JSON.parse(unescape(match.getAttribute('data-css-files'))));
				root.terratype.providers[q.id].loadCss = true;
			}
		},
		render: function (m) {
			m.ignoreEvents = 0;
			m.center = (m.autoFit) ? m.bound.getCenter() : m.positions[0].latlng;
			m.gmap = L.map(document.getElementById(m.div), {
				center: m.center,
				zoom: m.zoom,
				minZoom: m.minZoom,
				maxZoom: m.maxZoom,
				layers: m.layers,
				scrollWheelZoom: false,
				attributionControl: false,
				zoomControl: false
			});
			m.zoomControl = null;
			if (m.provider.zoomControl.enable) {
				m.zoomControl = L.control.zoom({
					position: q.controlPosition(m.provider.zoomControl.position)
				}).addTo(m.gmap);
			}
			m.gmap.on('zoomend', function () {
				if (m.ignoreEvents > 0) {
					return;
				}
				m.zoom = m.gmap.getZoom();
				root.terratype.callZoom(q, m, m.zoom);
			});
			m.gmap.on('load', function () {
				if (m.ignoreEvents > 0) {
					return;
				}
				var el = document.getElementById(m.div);
				if (root.terratype.isElementInViewport(el) && el.clientHeight != 0 && el.clientWidth != 0) {
					q.refresh(m);
				}
			});
			m.gmap.on('resize', function () {
				if (m.ignoreEvents > 0) {
					return;
				}
				q.refresh(m);
			});
			m.gmap.on('click', function () {
				q.closeInfoWindows(m);
			});
			m.cluster = m.positions.length > 1 ? L.markerClusterGroup({ chunkedLoading: m.positions.length > 100, zoomToBoundsOnClick: true }) : null;

			m.featureGroup = L.featureGroup().addTo(m.gmap).on('click', function (e) {
				q.openInfoWindow(m, e.layer.options.index);
			});

			root.terratype.forEach(m.positions, function (p, item) {
				item.marker = L.marker(item.latlng, {
					index: p,
					draggable: false,
					id: 'terratype_' + id + '_marker',
					icon: item.icon
				});
				item.info = null;
				if (item.label) {
					var l = document.getElementById(item.label);
					if (l) {
						item.info = item.marker.addTo(m.featureGroup).bindPopup(l.innerHTML);
						if (root.terratype.domDetectionType == 2 && item.autoShowLabel) {
							root.setTimeout(function () {
								q.openInfoWindow(m, p);
							}, 100);
						}
					}
				}
				if (m.cluster != null) {
					m.cluster.addLayer(item.marker);
				} else {
					item.marker.addTo(m.gmap);
				}
			});

			if (m.cluster != null) {
				m.gmap.addLayer(m.cluster);
			}
			m.status = 1;
		},
		controlPosition: function (i) {
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
			item.info.openPopup();
			root.terratype.callClick(q, m, item);
		},
		closeInfoWindows: function (m) {
			m.gmap.closePopup();
		},
		checkResize: function (m) {
			if (!m.gmap.getBounds().contains(m.center)) {
				q.refresh(m);
			}
		},
		reset: function (m) {
			if (m.refreshes == 0) {
				root.terratype.forEach(m.positions, function (p, item) {
					if (item.autoShowLabel) {
						root.setTimeout(function () {
							q.openInfoWindow(m, p);
						}, 100);
					}
				});
				m.status = 2;
			}
			if (m.refreshes == 0 || m.recenterAfterRefresh) {
				if (m.autoFit) {
					m.gmap.setZoom(m.maxZoom);
					var bound = new L.latLngBounds(m.bound.getNorthEast(), m.bound.getSouthWest());
					m.gmap.fitBounds(bound);
				}
				m.zoom = m.gmap.getZoom();
				m.gmap.setView(m.center, m.zoom);
			}

			if (m.refreshes++ == 0) {
				root.terratype.callRender(q, m);
			} else {
				root.terratype.callRefresh(q, m);
			}
		},
		refresh: function (m) {
			m.ignoreEvents++;
			if (m.recenterAfterRefresh) {
				m.gmap.setZoom(m.zoom);
				m.gmap.setView(m.center);
			}
			m.gmap.invalidateSize();
			setTimeout(function () {
				if (m.cluster != null) {
					m.cluster.refreshClusters();
				}
				q.reset(m);
				m.ignoreEvents--;
			}, 1);
		}
	};

	var timer = root.setInterval(function () {
		if (root.terratype && root.terratype.addProvider) {
			root.terratype.addProvider(q.id, q);
			root.clearInterval(timer);
		}
	}, 250);

}(window));


