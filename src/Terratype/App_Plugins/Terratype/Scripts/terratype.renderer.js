(function (root) {
	if (!root.terratype) {
		root.terratype = {
			poll: 100,
			killSwitch: 1200,
			positions: {},
			providers: {},
			addProvider: function (id, obj) {
				if (root.terratype.providers[id]) {
					root.terratype.providers[id] = root.terratype.mergeJson(root.terratype.providers[id], obj);
				} else {
					root.terratype.providers[id] = obj;
				}
				root.terratype.providers[id].status = 0;
				root.terratype.providers[id].domDetectionType = 99;
			},
			events: [[],[],[],[],[],[]],
			addEvent: function (i, f) {
				root.terratype.events[i].push(f);
			},
			callEvent: function (i, a, b, c) {
				root.terratype.forEach(root.terratype.events[i], function (index, func) {
					(function (f, a, b, c){ f(a, b, c); })(func, a, b, c);
				});
			},
			onInit: function (f) {
				root.terratype.addEvent(0, f);
			},
			callInit: function (provider) {
				root.terratype.callEvent(0, provider);
			},
			onLoad: function (f) {
				events[1].push(f);
			},
			callLoad: function (provider, map) {
				root.terratype.callEvent(1, provider, map);
			},
			onRender: function (f) {
				events[2].push(f);
			},
			callRender: function (provider, map) {
				root.terratype.callEvent(2, provider, map);
			},
			onRefresh: function (f) {
				events[3].push(f);
			},
			callRefresh: function (provider, map) {
				root.terratype.callEvent(3, provider, map);
			},
			onClick: function (f) {
				events[4].push(o);
			},
			callClick: function (provider, map, marker) {
				root.terratype.callEvent(4, provider, map, marker);
			},
			onZoom: function (f) {
				events[5].push(f);
			},
			callZoom: function (provider, map) {
				root.terratype.callEvent(5, provider, map);
			},
			//refresh: function (id) {
			//},
			//zoom: function (id, level) {
			//},
			//setPosition: function (id, datum) {
			//},
			forEach: function (obj, func) {
				for (var i = 0; i != obj.length; i++) {
					(function (f, i, o) { f(i, o); })(func, i, obj[i]);
				}
			},
			mergeJson: function (aa, bb) {        //  Does not merge arrays
				var mi = function (c) {
					var t = {};
					for (var k in c) {
						if (c[k] && typeof c[k] === 'object' && c[k].constructor.name !== 'Array') {
							t[k] = mi(c[k]);
						} else {
							t[k] = c[k];
						}
					}
					return t;
				}
				var mo = function (a, b) {
					var r = (a) ? mi(a) : {};
					if (b) {
						for (var k in b) {
							if (r[k] && typeof r[k] === 'object' && r[k].constructor.name !== 'Array') {
								r[k] = mo(r[k], b[k]);
							} else {
								r[k] = b[k];
							}
						}
					}
					return r;
				}
				return mo(aa, bb);
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
			parseLatLng: function (text) {
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
			isElementInViewport: function (el) {
				var rect = el.getBoundingClientRect();
				return (
					(rect.top <= (window.innerHeight || document.documentElement.clientHeight)) && ((rect.top + rect.height) >= 0) &&
					(rect.left <= (window.innerWidth || document.documentElement.clientWidth)) && ((rect.left + rect.width) >= 0)
				);
			},
			idleJs: function (provider, map) {
				//  Monitor dom changes via Javascript
				var element = document.getElementById(map.div);
				var newValue = element.parentElement.offsetTop + element.parentElement.offsetWidth;
				var newSize = element.clientHeight * element.clientWidth;
				var show = !(element.style.display && typeof element.style.display == 'string' && element.style.display.toLowerCase() == 'none');
				var visible = show && root.terratype.isElementInViewport(element);
				if (newValue != 0 && show == false) {
					//console.log('A ' + m.id + ': in viewport = ' + visible + ', showing = ' + show);
					//  Was hidden, now being shown
					element.style.display = 'block';
				} else if (newValue == 0 && show == true) {
					//console.log('B ' + m.id + ': in viewport = ' + visible + ', showing = ' + show);
					//  Was shown, now being hidden
					element.style.display = 'none';
					map.visible = false;
				}
				else if (visible == true && map.divoldsize != 0 && newSize != 0 && map.divoldsize != newSize) {
					//console.log('C ' + m.id + ': in viewport = ' + visible + ', showing = ' + show);
					//  showing, just been resized and map is visible
					(function (p, m) { provider.refresh.call(p, m); })(provider, map);
					map.visible = true;
				} else if (visible == true && map.visible == false) {
					//console.log('D ' + m.id + ': in viewport = ' + visible + ', showing = ' + show);
					//  showing and map just turned visible
					(function (p, m) { provider.refresh.call(p, m); })(provider, map);
					map.visible = true;
				} else if (visible == false && map.visible == true) {
					//console.log('E ' + m.id + ': in viewport = ' + visible + ', showing = ' + show);
					//  was visible, but now hiding
					map.visible = false;
				}
				map.divoldsize = newSize;
			},
			idleJquery: function (provider, map) {
				//  Monitor dom changes via jQuery
				var r = false;
				var element = jQuery(document.getElementById(map.div));
				var show = !(element.is(':hidden'));
				var visible = element.is(':visible');
				if (show == visible) {
					if (show) {
						var newSize = element.height() * element.width();
						if (newSize != map.divoldsize) {
							(function (p, m) { provider.refresh.call(p, m); })(provider, map);
						}
						map.divoldsize = newSize;
					}
					return;
				}
				if (show) {
					element.hide();
					map.divoldsize = 0;
					(function (p, m) { provider.refresh.call(p, m); })(provider, map);
					return;
				}
				element.show();
				(function (p, m) { provider.refresh.call(p, m); })(provider, map);
				map.divoldsize = element.height() * element.width();
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
			getMap: function (maps, mapId) {
				for (var i = 0; i != maps.length; i++) {
					if (maps[i].id == mapId) {
						return maps[i];
					}
				}
				return null;
			},
			jQueryMonitoring: false,
			jQueryMonitorTimer: null,
			jQueryMonitor: function () {
				var providerCounter = 0;
				var mapCounter = 0;
				var providers = [];
				for (var provider in root.terratype.providers) {
					providers.push(provider.id);
				}
				if (root.terratype.jQueryMonitorTimer != null) {
					root.clearInterval(root.terratype.jQueryMonitorTimer);
				}
				root.terratype.jQueryMonitorTimer = root.setInterval(function () {
					if (providerCounter == providers.length) {
						root.clearInterval(root.terratype.jQueryMonitorTimer);
					} else {
						var provider = root.terratype.providers[providers[providerCounter]];
						if (mapCounter == provider.maps.length) {
							providerCounter++;
							mapCounter = 0;
						} else {
							root.terratype.idleJquery(provider, provider.maps[mapCounter++]);
						}
					}
				}, root.terratype.poll);
			},
			initTimer: null,
			init: function () {
				var kill = 0;
				var providers = null;
				var providerCounter = 0;
				var activeCounter = 0;
				var mapCounter = 0;
				var mapRunning = 0;
				var jQueryMonitoring
				if (root.terratype.initTimer != null) {
					root.clearInterval(root.terratype.initTimer);
				}
				root.terratype.initTimer = root.setInterval(function () {
					kill++;
					if (providers == null) {
						providers = [];
						for (var provider in root.terratype.providers) {
							providers.push(provider);
						}
						activeCounter = 0;
						providerCounter = 0;
						mapCounter = 0;
						mapRunning = 0;
					} else if (providerCounter == providers.length) {
						providers = null;
						if (activeCounter == 0 && kill > root.terratype.killSwitch) {
							root.clearInterval(root.terratype.initTimer);
						}	
					} else {
						var provider = root.terratype.providers[providers[providerCounter]];

						if (provider.status == 2 && mapCounter < provider.maps.length) {
							var m = provider.maps[mapCounter++];
							switch (m.status) {
								case 0:		//	Needs rendering
									(function (p, m) { provider.render.call(p, m); })(provider, m);
									activeCounter++;
									mapRunning++;
									break;

								case 1:		//	Needs monitoring
									if (root.jQuery && provider.domDetectionType == 1) {
										if (jQueryMonitoring == false) {
											root.jQuery(window).on('DOMContentLoaded load resize scroll touchend', root.terratype.jQueryMonitor);
											jQueryMonitoring = true;
										}
									} else if (provider.domDetectionType != 2) {
										activeCounter++;
										root.terratype.idleJs(provider, m);
									}
									mapRunning++;
									break;
							}
						} else {
							switch (provider.status) {
								case -1:	//	This provider currently has no maps to render
									break;

								case 0:		//	Waiting for support javascript libraries to load
									activeCounter++;
									if (provider.ready()) {
										provider.status = 1;
										root.terratype.callInit(provider);
									}
									break;

								case 1:		//	Load maps
									activeCounter++;
									var matches = document.getElementsByClassName(provider.id);
									if (matches.length == 0) {
										provider.status = -1;
									} else {
										root.terratype.forEach(matches, function (i, match) {
											var domDetectionType = parseInt(match.getAttribute('data-dom-detection-type'));
											if (provider.domDetectionType > domDetectionType) {
												provider.domDetectionType = domDetectionType;
											}
											mapId = match.getAttribute('data-map-id');
											id = match.getAttribute('data-id');
											var model = JSON.parse(unescape(match.getAttribute('data-model')));
											var m = root.terratype.getMap(provider.maps, mapId);
											if (m == null) {
												match.style.display = 'block';
												m = root.terratype.mergeJson((provider.loadMap) ?
													provider.loadMap.call(provider, model, match) :
													{}, {
													ignoreEvents: 0,
													refreshes: 0,
													id: mapId,
													div: id,
													divoldsize: 0,
													status: 0,
													visible: false,
													autoFit: match.getAttribute('data-auto-fit'),
													recenterAfterRefresh: match.getAttribute('data-recenter-after-refresh')
												});
												provider.maps.push(m);
											}
											if (provider.loadMarker) {
												(function (p, m, model, match) { provider.loadMarker.call(p, m, model, match); })(provider, m, model, match);
											}
										});
										root.terratype.forEach(provider.maps, function (i, m) {
											root.terratype.callInit(provider, m);
										});
										provider.status = 2;
									}
									break;

								case 2:		//	Monitoring
									activeCounter++;
									if (mapRunning == 0) {
										provider.status = -1;
									}
									break;
							}
							providerCounter++;
							mapCounter = 0;
							mapRunning = 0;
						}

					}
				}, root.terratype.poll);
			},
		};

		root.terratype.init();
	}
}(window));
