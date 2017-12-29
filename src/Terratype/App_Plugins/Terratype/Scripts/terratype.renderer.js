(function (root) {
	if (!root.terratype) {
		root.terratype = {
			positions: {},
			providers: {},
			addProvider: function (id, obj) {
				if (root.terratype.providers[id]) {
					root.terratype.providers[id] = root.terratype.mergeJson(root.terratype.providers[id], obj);
				} else {
					root.terratype.providers[id] = obj;
				}
			},
			onInit: function (o) {
			},
			onLoad: function (o) {
			},
			onRefresh: function (o) {
			},
			onClick: function (o) {
			},
			onZoom: function (o) {
			},
			refresh: function (id) {
			},
			zoom: function (id, level) {
			},
			setPosition: function (id, datum) {
			},
			mergeJson: function (aa, bb) {        //  Does not merge arrays
				var mi = function (c) {
					var t = {};
					for (var k in c) {
						if (typeof c[k] === 'object' && c[k].constructor.name !== 'Array') {
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
		};
	}
}(window));
