(function (root) {

	var q = {
		id: 'Terratype.LeafletV1',
		poll: 100,
		maps: [],
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
		init: function () {
			q.load();
			if (q.domDetectionType == 1) {
				counter = 0;
				var t = setInterval(function () {
					//  Is jquery loaded
					if (root.jQuery) {
						clearInterval(t);
						q.updateJquery();
					}
					if (++counter > q.jqueryLoadWait) {
						//  We have waited long enough for jQuery to load, and nothing, so default to javascript
						console.warn("Terratype was asked to use jQuery to monitor DOM changes, yet no jQuery library was detected. Terratype has defaulted to using javascript to detect DOM changes instead");
						clearInterval(t);
						q.domDetectionType = 0;
						q.updateJs();
					}
				}, q.poll);
			} else {
				q.updateJs();
			}
		},
		loadCss: function (css) {
			for (var c = 0; c != css.length; c++) {
				if (document.createStyleSheet) {
					document.createStyleSheet(css[c]);
				} else {
					var l = document.createElement('link');
					l.rel = 'stylesheet';
					l.type = 'text/css';
					l.href = css[c];
					l.media = 'screen';
					document.getElementsByTagName('head')[0].appendChild(l);
				}
			}
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
						if (m.domDetectionType == 2) {
							m.status = -1;
						} else if (m.domDetectionType == 1 && root.jQuery) {
							q.idleJquery(m);
						} else {
							q.idleJs(m);
						}
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
					if (q.domDetectionType != 2) {
						jQuery(window).on('DOMContentLoaded load resize scroll touchend', function () {
							counter = 0;
							var timer2 = setInterval(function () {
								if (counter == q.maps.length) {
									clearInterval(timer2);
								} else {
									var m = q.maps[counter];
									if (m.status > 0 && m.positions.length != 0) {
										if (m.domDetectionType == 1) {
											q.idleJquery(m);
										} else {
											q.idleJs(m);
										}
									}
									counter++;
								}
							}, q.poll);
						});
					}
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
			layers: [{
				maxZoom: 18,
				id: 'OpenStreetMap.Mapnik'
			}],
			zoomControl: {
				enable: true,
				position: 1
			}
		},
		domDetectionType: 99,
		load: function () {
			var matches = document.getElementsByClassName(q.id);
			for (var i = 0; i != matches.length; i++) {
				if (i == 0) {
					q.loadCss(JSON.parse(unescape(matches[i].getAttribute('data-css-files'))));
				}
				var domDetectionType = parseInt(matches[i].getAttribute('data-dom-detection-type'));
				if (q.domDetectionType > domDetectionType) {
					q.domDetectionType = domDetectionType;
				}
				mapId = matches[i].getAttribute('data-map-id');
				id = matches[i].getAttribute('data-id');
				var model = JSON.parse(unescape(matches[i].getAttribute('data-leafletv1')));
				var datum = root.terratype.parseLatLng(model.position.datum);
				var latlng = new L.latLng(datum.latitude, datum.longitude);
				var m = q.getMap(mapId);
				if (m == null) {
					m = {
						id: mapId,
						div: id,
						zoom: model.zoom,
						provider: root.terratype.mergeJson(q.defaultProvider, model.provider),
						positions: [],
						center: latlng,
						divoldsize: 0,
						status: 0,
						visible: false,
						minZoom: null,
						maxZoom: null,
						layers: null,
						domDetectionType: domDetectionType,
						autoFit: matches[i].getAttribute('data-auto-fit'),
						recenterAfterRefresh: matches[i].getAttribute('data-recenter-after-refresh')
					};
					matches[i].style.display = 'block';
					q.maps.push(m);
				}
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

				if (model.icon && model.icon.url) {
					m.positions.push({
						id: id,
						label: matches[i].getAttribute('data-label-id'),
						latlng: latlng,
						icon: L.icon({
							iconUrl: root.terratype.configIconUrl(model.icon.url),
							iconSize: [model.icon.size.width, model.icon.size.height],
							iconAnchor: [root.terratype.getAnchorHorizontal(model.icon.anchor.horizontal, model.icon.size.width),
								root.terratype.getAnchorVertical(model.icon.anchor.vertical, model.icon.size.height)]
						}),
						autoShowLabel: matches[i].getAttribute('data-auto-show-label')
					});
				}
			}
		},
		render: function (m) {
			m.ignoreEvents = 0;
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

			with ({
				mm: m
			}) {
				mm.gmap.on('zoomend', function () {
					if (mm.ignoreEvents > 0) {
						return;
					}
					//q.closeInfoWindows(mm);
					mm.zoom = mm.gmap.getZoom();
				});
				mm.gmap.on('load', function () {
					if (mm.ignoreEvents > 0) {
						return;
					}
					q.refresh(mm);
					mm.status = 2;
				});
				mm.gmap.on('resize', function () {
					if (mm.ignoreEvents > 0) {
						return;
					}
					q.checkResize(mm);
				});
				//scope.gmarker.on('click', function () {
				//    if (mm.ignoreEvents > 0) {
				//        return;
				//    }
				//    q.closeInfoWindows(mm);
				//});
			}
			m.ginfos = [];
			m.gmarkers = [];
			m.cluster = m.positions.length > 1 ? L.markerClusterGroup({ chunkedLoading: m.positions.length > 100, zoomToBoundsOnClick: true }) : null;

			for (var p = 0; p != m.positions.length; p++) {
				var item = m.positions[p];
				m.gmarkers[p] = L.marker(item.latlng, {
					draggable: false,
					id: 'terratype_' + id + '_marker',
					icon: item.icon
				});
				m.ginfos[p] = null;
				if (item.label) {
					var l = document.getElementById(item.label);
					if (l) {
						m.ginfos[p] = m.gmarkers[p].bindPopup(l.innerHTML);
					}

					if (item.autoShowLabel) {
						with ({
							mm: m,
							pp: p
						}) {
							root.setTimeout(function () {
								mm.ginfos[pp].openPopup();
							}, 100);
						}
					}

				}
				if (m.cluster != null) {
					m.cluster.addLayer(m.gmarkers[p]);
				} else {
					m.gmarkers[p].addTo(m.gmap);
				}
			}

			if (m.cluster != null) {
				m.gmap.addLayer(m.cluster);
			}
			m.status = 1;
		},
		closeInfoWindows: function (m) {
			m.gmap.closePopup();
		},
		checkResize: function (m) {
			if (!m.gmap.getBounds().contains(m.center)) {
				q.refresh(m);
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
				m.ignoreEvents--;
			}, 1);
		},
		idleJs: function (m) {
			//  Monitor dom changes via Javascript
			var element = document.getElementById(m.div);
			var newValue = element.parentElement.offsetTop + element.parentElement.offsetWidth;
			var newSize = element.clientHeight * element.clientWidth;
			var show = !(element.style.display && typeof element.style.display == 'string' && element.style.display.toLowerCase() == 'none');
			var visible = show && root.terratype.isElementInViewport(element);
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
		},
		idleJquery: function (m) {
			//  Monitor dom changes via jQuery
			var element = jQuery(document.getElementById(m.div));
			var show = !(element.is(':hidden'));
			var visible = element.is(':visible');
			if (show == visible) {
				if (show) {
					var newSize = element.height() * element.width();
					if (newSize != m.divoldsize) {
						q.refresh(m);
					}
					m.divoldsize = newSize;
				}
				return;
			}
			if (show) {
				element.hide();
				m.divoldsize = 0;
				return;
			}
			element.show();
			q.refresh(m);
			m.divoldsize = element.height() * element.width();
		}
	};

	var timer = setInterval(function () {
		if (L && L.MarkerClusterGroup && root.terratype && root.terratype.providers && typeof root.terratype.providers[q.id] !== 'undefined' && typeof root.terratype.providers[q.id].tileServers !== 'undefined') {
			clearInterval(timer);
			root.terratype.addProvider(q.id, q);
			root.setTimeout(q.init, 100);
		}
	}, 500);
}(window));


