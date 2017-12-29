(function (root) {

	var q = {
		id: 'Terratype.GoogleMapsV3',
		poll: 100,
		jqueryLoadWait: 30,
		markerClustererUrl: function () {
			return document.getElementsByClassName(q.id)[0].getAttribute('data-markerclusterer-url')
		},
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

		domDetectionType: 99,
		load: function () {
			var matches = document.getElementsByClassName(q.id);
			for (var i = 0; i != matches.length; i++) {
				mapId = matches[i].getAttribute('data-map-id');
				id = matches[i].getAttribute('data-id');
				var domDetectionType = parseInt(matches[i].getAttribute('data-dom-detection-type'));
				if (q.domDetectionType > domDetectionType) {
					q.domDetectionType = domDetectionType;
				}
				var model = JSON.parse(unescape(matches[i].getAttribute('data-googlemapsv3')));
				var m = q.getMap(mapId);
				if (m == null) {
					m = {
						id: mapId,
						div: id,
						zoom: model.zoom,
						provider: root.terratype.mergeJson(q.defaultProvider, model.provider),
						positions: [],
						center: null,
						divoldsize: 0,
						status: 0,
						visible: false,
						domDetectionType: domDetectionType,
						bound: new google.maps.LatLngBounds(null),
						autoFit: matches[i].getAttribute('data-auto-fit'),
						recenterAfterRefresh: matches[i].getAttribute('data-recenter-after-refresh'),
						ignoreEvents: 0,
						refreshes: 0
					};
					matches[i].style.display = 'block';
					q.maps.push(m);
				}
				if (model.icon && model.icon.url) {
					var datum = root.terratype.parseLatLng(model.position.datum);
					var latlng = new root.google.maps.LatLng(datum.latitude, datum.longitude);
					m.positions.push({
						id: id,
						label: matches[i].getAttribute('data-label-id'),
						latlng: latlng,
						icon: {
							url: root.terratype.configIconUrl(model.icon.url),
							scaledSize: new root.google.maps.Size(model.icon.size.width, model.icon.size.height),
							anchor: new root.google.maps.Point(
								root.terratype.getAnchorHorizontal(model.icon.anchor.horizontal, model.icon.size.width),
								root.terratype.getAnchorVertical(model.icon.anchor.vertical, model.icon.size.height))
						},
						autoShowLabel: matches[i].getAttribute('data-auto-show-label')
					});
					m.bound.extend(latlng);
				}
			}
		},
		render: function (m) {
			var mapTypeIds = q.mapTypeIds(m.provider.variety.basic, m.provider.variety.satellite, m.provider.variety.terrain);
			m.center = (m.autoFit) ? (new google.maps.LatLngBounds(m.bound.getSouthWest(), m.bound.getNorthEast())).getCenter() : m.positions[0].latlng;
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
					var el = document.getElementById(mm.div);
					if (root.terratype.isElementInViewport(el) && el.clientHeight != 0 && el.clientWidth != 0) {
						console.log('tilesloaded:' + mm.id);
						q.refresh(mm);
					}
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
					with ({
						mm: m,
						pp: p
					}) {
						mm.gmarkers[p].addListener('click', function () {
							//console.warn(mm.id + ': iconClick(): ignoreEvents = ' + mm.ignoreEvents);
							if (mm.ignoreEvents > 0) {
								return;
							}
							q.closeInfoWindows(mm);
							if (mm.ginfos[pp] != null) {
								mm.ginfos[pp].open(mm.gmap, mm.gmarkers[pp]);
							}
						});
					}
				}
			}

			if (m.positions.length > 1) {
				m.markerclusterer = new MarkerClusterer(m.gmap, m.gmarkers, { imagePath: q.markerClustererUrl() });
			}
			m.status = 1;
		},
		closeInfoWindows: function (m) {
			for (var p = 0; p != m.positions.length; p++) {
				if (m.ginfos[p] != null) {
					m.ginfos[p].close();
				}
			}
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
			m.gmap.setCenter(m.center);
		},
		checkResetCenter: function (m) {
			if (m.refreshes == 0) {
				console.log('checkResetCenter: ' + m.id);
				for (var p = 0; p != m.positions.length; p++) {
					var item = m.positions[p];
					if (item.autoShowLabel) {
						with ({
							mm: m,
							pp: p
						}) {
							root.setTimeout(function () {
								mm.ginfos[pp].open(mm.gmap, mm.gmarkers[pp]);
							}, 100);
						}
					}
				}
				m.status = 2;
			}
			if (m.refreshes == 0 || m.recenterAfterRefresh) {
				q.resetCenter(m);
			}
			m.refreshes++;
		},
		refresh: function (m) {
			m.ignoreEvents++;
			with ({
				mm: m
			}) {
				root.google.maps.event.addListenerOnce(mm.gmap, 'idle', function () {
					if (mm.idle == null) {
						return;
					}
					mm.ignoreEvents--;
					if (mm.ignoreEvents == 0) {
						q.checkResetCenter(mm);
						clearTimeout(mm.idle);
						mm.idle = null;
					}
					if (mm.idle) {
						clearTimeout(mm.idle);
					}
				});
				mm.idle = setTimeout(function () {
					if (mm.ignoreEvents != 0) {
						q.checkResetCenter(mm);
						mm.ignoreEvents = 0
					}
					clearTimeout(mm.idle);
					mm.idle = null;
				}, 5000);
			}
			root.google.maps.event.trigger(m.gmap, 'resize');
		},
		idleJs: function (m) {
			//  Monitor dom changes via Javascript
			var el = document.getElementById(m.div);
			var newValue = el.parentElement.offsetTop + el.parentElement.offsetWidth;
			var newSize = el.clientHeight * el.clientWidth;
			var show = !(el.style.display && typeof el.style.display == 'string' && el.style.display.toLowerCase() == 'none');
			var visible = show && root.terratype.isElementInViewport(el);
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
			var el = jQuery(document.getElementById(m.div));
			var show = !(el.is(':hidden'));
			var visible = el.is(':visible');
			if (show == visible) {
				if (show) {
					var newSize = el.height() * el.width();
					if (newSize != m.divoldsize) {
						q.refresh(m);
					}
					m.divoldsize = newSize;
				}
				return;
			}
			if (show) {
				el.hide();
				m.divoldsize = 0;
				return;
			}
			el.show();
			q.refresh(m);
			m.divoldsize = el.height() * el.width();
		}
	};

	root.TerratypeGoogleMapsV3CallbackRender = function () {
		var timer = root.setInterval(function () {
			if (root.terratype) {
				root.clearInterval(timer);
				root.terratype.addProvider(q.id, q);
				root.setTimeout(q.init, 100);
			}
		}, 500);
	}
}(window));


