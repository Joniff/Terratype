(function (root) {

	var isGmapsReady = false;

	var q = {
		id: 'Terratype.GoogleMapsV3',
		maps: [],
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
		ready: function () {
			return isGmapsReady;
		},
		loadMap: function (model, match) {
			return {
				zoom: model.zoom,
				provider: root.terratype.mergeJson(q.defaultProvider, model.provider),
				positions: [],
				center: null,
				bound: new google.maps.LatLngBounds(null)
			};
		},
		loadMarker: function (m, model, match) {
			if (model.icon && model.icon.url) {
				var datum = root.terratype.parseLatLng(model.position.datum);
				var latlng = new root.google.maps.LatLng(datum.latitude, datum.longitude);
				m.positions.push({
					id: id,
					label: match.getAttribute('data-label-id'),
					latlng: latlng,
					icon: {
						url: root.terratype.configIconUrl(model.icon.url),
						scaledSize: new root.google.maps.Size(model.icon.size.width, model.icon.size.height),
						anchor: new root.google.maps.Point(
							root.terratype.getAnchorHorizontal(model.icon.anchor.horizontal, model.icon.size.width),
							root.terratype.getAnchorVertical(model.icon.anchor.vertical, model.icon.size.height))
					},
					autoShowLabel: match.getAttribute('data-auto-show-label')
				});
				m.bound.extend(latlng);
			}
		},
		markerClustererUrl: function () {
			return document.getElementsByClassName(q.id)[0].getAttribute('data-markerclusterer-url')
		},
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
		render: function (m) {
			var mapTypeIds = q.mapTypeIds(m.provider.variety.basic, m.provider.variety.satellite, m.provider.variety.terrain);
			m.center = (m.autoFit) ? m.bound.getCenter() : m.positions[0].latlng;
			m.gmap = new root.google.maps.Map(document.getElementById(m.div), {
				disableDefaultUI: false,
				scrollwheel: false,
				panControl: false,      //   Has been deprecated
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
			root.google.maps.event.addListener(m.gmap, 'zoom_changed', function () {
				if (m.ignoreEvents > 0) {
					return;
				}
				q.closeInfoWindows(m);
				m.zoom = m.gmap.getZoom();
				root.terratype.callZoom(q, m);
			});
			root.google.maps.event.addListenerOnce(m.gmap, 'tilesloaded', function () {
				var el = document.getElementById(m.div);
				if (root.terratype.isElementInViewport(el) && el.clientHeight != 0 && el.clientWidth != 0) {
					q.refresh(m);
				}
			});
			root.google.maps.event.addListener(m.gmap, 'resize', function () {
				if (m.ignoreEvents > 0) {
					return;
				}
				q.checkResize(m);
			});
			root.google.maps.event.addListener(m.gmap, 'click', function () {
				if (m.ignoreEvents > 0) {
					return;
				}
				q.closeInfoWindows(m);
			});
			m.ginfos = [];
			m.gmarkers = [];

			root.terratype.forEach(m.positions, function (p, item) {
				m.gmarkers[p] = new root.google.maps.Marker({
					map: m.gmap,
					position: item.latlng,
					id: item.id,
					draggable: false,
					icon: item.icon
				});

				m.ginfos[p] = null;
				var l = (item.label) ? document.getElementById(item.label) : null;
				if (l) {
					m.ginfos[p] = new root.google.maps.InfoWindow({
						content: l
					});
					m.gmarkers[p].addListener('click', function () {
						if (m.ignoreEvents > 0) {
							return;
						}
						q.closeInfoWindows(m);
						if (m.ginfos[p] != null) {
							q.openInfoWindow(m, p);
						}
					});
				}
			});

			if (m.positions.length > 1) {
				m.markerclusterer = new MarkerClusterer(m.gmap, m.gmarkers, { imagePath: q.markerClustererUrl() });
			}
			m.status = 1;
		},
		openInfoWindow: function (m, p) {
			m.ginfos[p].open(m.gmap, m.gmarkers[p]);
			root.terratype.callClick(q, m, p);
		},
		closeInfoWindows: function (m) {
			root.terratype.forEach(m.positions, function (p, item) {
				if (m.ginfos[p] != null) {
					m.ginfos[p].close();
				}
			});
		},
		checkResize: function (m) {
			if (!m.gmap.getBounds().contains(m.center)) {
				q.refresh(m);
			}
		},
		resetCenter: function (m) {
			if (m.autoFit) {
				m.gmap.setZoom(20);
				m.gmap.fitBounds(m.bound);
			}
			m.zoom = m.gmap.getZoom();
			m.gmap.setCenter(m.center);
		},
		checkResetCenter: function (m) {
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
				q.resetCenter(m);
			}
			if (m.refreshes++ == 0) {
				root.terratype.callRender(q, m);
			} else {
				root.terratype.callRefresh(q, m);
			}
		},
		refresh: function (m) {
			m.ignoreEvents++;
			root.google.maps.event.addListenerOnce(m.gmap, 'idle', function () {
				if (m.idle == null) {
					return;
				}
				m.ignoreEvents--;
				if (m.ignoreEvents == 0) {
					q.checkResetCenter(m);
					root.clearTimeout(m.idle);
					m.idle = null;
				}
				if (m.idle) {
					root.clearTimeout(m.idle);
				}
			});
			m.idle = root.setTimeout(function () {
				if (m.ignoreEvents != 0) {
					q.checkResetCenter(m);
					m.ignoreEvents = 0
				}
				root.clearTimeout(m.idle);
				m.idle = null;
			}, 5000);
			root.google.maps.event.trigger(m.gmap, 'resize');
		}
	};

	var timer = root.setInterval(function () {
		if (root.terratype && root.terratype.addProvider) {
			root.terratype.addProvider(q.id, q);
			root.clearInterval(timer);
		}
	}, 250);

	root.TerratypeGoogleMapsV3CallbackRender = function () {
		isGmapsReady = true;
	}
}(window));


