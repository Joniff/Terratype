(function (root) {

	var allowBingToHandleResizes = true;

	var q = {
		id: 'Terratype.BingMapsV8',
		poll: 100,
		maps: [],
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
		init: function () {
			if (q.load()) {
				root.Microsoft.Maps.loadModule('Microsoft.Maps.Traffic', q.update);
			} else {
				q.update();
			}
		},
		update: function () {
			if (allowBingToHandleResizes) {
				q.updateBing();
			} else {
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
			}
		},
		updateBing: function () {
			//  Let Bing monitor page resizes, dom changes, scrolling
			var counter = 0;
			var timer = setInterval(function () {
				if (counter == q.maps.length) {
					clearInterval(timer);
					return;
				}
				q.render(q.maps[counter]);
				counter++;
			}, q.poll);
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
		domDetectionType: 99,
		load: function () {
			var needTraffic = false;
			var matches = document.getElementsByClassName(q.id);
			for (var i = 0; i != matches.length; i++) {
				mapId = matches[i].getAttribute('data-map-id');
				id = matches[i].getAttribute('data-id');
				var domDetectionType = parseInt(matches[i].getAttribute('data-dom-detection-type'));
				if (q.domDetectionType > domDetectionType) {
					q.domDetectionType = domDetectionType;
				}

				var model = JSON.parse(unescape(matches[i].getAttribute('data-bingmapsv8')));
				var datum = root.terratype.parseLatLng(model.position.datum);
				var latlng = new root.Microsoft.Maps.Location(datum.latitude, datum.longitude);
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
						height: model.height,
						domDetectionType: domDetectionType
					};
					matches[i].style.display = 'block';
					q.maps.push(m);
				}
				if (model.icon && model.icon.url) {
					m.positions.push({
						id: id,
						label: matches[i].getAttribute('data-label-id'),
						latlng: latlng,
						icon: model.icon.url,
						anchor: new root.Microsoft.Maps.Point(
							root.terratype.getAnchorHorizontal(model.icon.anchor.horizontal, model.icon.size.width),
							root.terratype.getAnchorVertical(model.icon.anchor.vertical, model.icon.size.height)),
						autoShowLabel: matches[i].getAttribute('data-auto-show-label')
					});
				}
				if (model.provider.traffic.enable == true) {
					needTraffic = true;
				}
			}
			return needTraffic;
		},
		render: function (m) {
			m.ignoreEvents = 0;
			var mapTypeIds = q.mapTypeIds(m.provider.variety.basic, m.provider.variety.satellite, m.provider.variety.streetView, m.provider.predefineStyling);
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
			m.gmap.setView({
				center: m.center,
				zoom: m.zoom,
				mapTypeId: mapTypeIds[0],
				labelOverlay: m.provider.showLabels ? root.Microsoft.Maps.LabelOverlay.visible : root.Microsoft.Maps.LabelOverlay.hidden,
			});
			if (m.provider.traffic.enable == true) {
				m.traffic = new root.Microsoft.Maps.Traffic.TrafficManager(m.gmap);
				m.traffic.show();
				if (m.provider.traffic.legend) {
					m.traffic.showLegend();
				} else {
					m.traffic.hideLegend();
				}
			}

			with ({
				mm: m
			}) {
				root.Microsoft.Maps.Events.addHandler(mm.gmap, 'viewchangeend', function () {
					if (mm.ignoreEvents > 0) {
						return;
					}
					mm.zoom = mm.gmap.getZoom();
					q.closeInfoWindows(mm);
				});
				root.Microsoft.Maps.Events.addHandler(mm.gmap, 'click', function () {
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

				m.gmarkers[p] = new root.Microsoft.Maps.Pushpin(item.latlng, {
					id: item.id,
					draggable: false,
					icon: item.icon,
					anchor: item.anchor
				});

				m.ginfos[p] = null;
				if (document.getElementById(item.label) != null) {
					with ({
						mm: m,
						pp: p
					}) {
						mm.ginfos[pp] = new root.Microsoft.Maps.Infobox(item.latlng, {
							description: ' ',
							visible: false,
							pushpin: mm.gmarkers[pp]
						});
						mm.ginfos[pp]._options.description = document.getElementById(item.label).innerHTML;
						mm.ginfos[pp].setMap(mm.gmap);
						root.Microsoft.Maps.Events.addHandler(mm.gmarkers[pp], 'click', function () {
							if (mm.ignoreEvents > 0) {
								return;
							}
							q.closeInfoWindows(mm);
							if (mm.ginfos[pp]) {
								mm.ginfos[pp].setOptions({
									visible: !mm.ginfos[pp].getVisible()
								});
							}
						});
					}
				}
			}

			if (m.positions.length > 1) {
				m.clusterLayer = new root.Microsoft.Maps.ClusterLayer(m.gmarkers);
				m.gmap.layers.insert(m.clusterLayer);
			} else {
				m.gmap.entities.push(m.gmarkers[0]);
			}
			m.status = 1;
		},
		closeInfoWindows: function (m) {
			for (var p = 0; p != m.positions.length; p++) {
				if (m.ginfos[p] != null && m.ginfos[p].getVisible()) {
					m.ginfos[p].setOptions({
						visible: false
					});
				}
			}
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
			m.gmap.setView({
				zoom: m.zoom
			});
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
				mapId = mapTypeIds[i];
			}
			m.gmap.setMapType(Microsoft.Maps.MapTypeId.mercator);
			setTimeout(function () {
				m.gmap.setMapType(mapId);
				m.ignoreEvents--;
			}, 1)
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


	root.TerratypeBingMapsV8CallbackRender = function () {
		root.Microsoft.Maps.loadModule("Microsoft.Maps.Clustering", function () {
			var timer = root.setInterval(function () {
				if (root.terratype) {
					root.clearInterval(timer);
					root.terratype.addProvider(q.id, q);
					root.setTimeout(q.init, 100);
    			}
    		}, 500);
        });
    }
}(window));


