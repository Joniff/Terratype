(function (root) {

    var packageName = 'Terratype';

    if (!root.terratype) {
        root.terratype = {
            loading: false,
            providers: {}
        };
    }

    angular.module('umbraco').directive('terratypeJson', function () {
        return {
            restrict: 'A', // only activate on element attribute
            require: 'ngModel', // get a hold of NgModelController
            link: function (scope, element, attrs, ngModelCtrl) {

                var lastValid;

                // push() if faster than unshift(), and avail. in IE8 and earlier (unshift isn't)
                ngModelCtrl.$parsers.push(fromUser);
                ngModelCtrl.$formatters.push(toUser);

                // clear any invalid changes on blur
                element.bind('blur', function () {
                    element.val(toUser(scope.$eval(attrs.ngModel)));
                });

                // $watch(attrs.ngModel) wouldn't work if this directive created a new scope;
                // see http://stackoverflow.com/questions/14693052/watch-ngmodel-from-inside-directive-using-isolate-scope how to do it then
                scope.$watch(attrs.ngModel, function (newValue, oldValue) {
                    lastValid = lastValid || newValue;

                    if (newValue != oldValue) {
                        ngModelCtrl.$setViewValue(toUser(newValue));

                        // TODO avoid this causing the focus of the input to be lost
                        ngModelCtrl.$render();
                    }
                }, true); // MUST use objectEquality (true) here, for some reason

                function fromUser(text) {
                    // Beware: trim() is not available in old browsers
                    if (!text || text.trim() === '') {
                        return {};
                    } else {
                        try {
                            lastValid = angular.fromJson(text);
                            ngModelCtrl.$setValidity('invalidJson', true);
                        } catch (e) {
                            ngModelCtrl.$setValidity('invalidJson', false);
                        }
                        return lastValid;
                    }
                }

                function toUser(object) {
                    // better than JSON.stringify(), because it formats + filters $$hashKey etc.
                    return angular.toJson(object, true);
                }
            }
        };
    });


    //  Display language values that contain {{}} variables. The language values need to contain html tags
    angular.module("umbraco.directives").directive('terratypeTranslate', ['$compile', 'localizationService', function ($compile, localizationService) {
        return function (scope, element, attr) {
            attr.$observe('terratypeTranslate', function (key) {
                localizationService.localize(key).then(function (value) {
                    var c = $compile('<span>' + value + '</span>')(scope);
                    element.append(c);
                });
            })
        }
    }]);

    angular.module('umbraco').controller('terratype', ['$scope', '$timeout', '$http', '$injector', 'localizationService', function ($scope, $timeout, $http, $injector, localizationService) {
        $scope.config = null;
        $scope.store = null;
        $scope.view = function () {
            return $scope.main;
        };

        $scope.main = {
            urlProvider: function (id, file, cache) {
                var r = Umbraco.Sys.ServerVariables.umbracoSettings.appPluginsPath + '/' + id + '/' + file;
                if (cache == true) {
                    r += '?cache=1.0.5';
                }
                return r;
            },
            images: {
                loading: Umbraco.Sys.ServerVariables.umbracoSettings.umbracoPath + '/assets/img/loader.gif',
                failed: Umbraco.Sys.ServerVariables.umbracoSettings.umbracoPath + '/images/false.png',
                success: Umbraco.Sys.ServerVariables.umbracoSettings.umbracoPath + '/images/true.png',
            },
            loading: true,
            configgering: false,
            controller: function (a) {
                return Umbraco.Sys.ServerVariables.umbracoSettings.umbracoPath + '/backoffice/' + packageName + '/ajax/' + a;
            },
            poll: 250,
            identifier: $scope.$id + (new Date().getTime()),
            error: null,
            isPreview: false,
            position: [],
            providers: [],
            provider: {
                id: null,
                referenceUrl: null,
                name: null
            },
            mapId: function (array, id) {
                for (var i = 0; i != array.length; i++) {
                    if (array[i].id == id) {
                        return i;
                    }
                }
                return -1;
            },
            translate: function (m) {
                localizationService.localize(m.name).then(function (value) {
                    m.name = value;
                });
                localizationService.localize(m.description).then(function (value) {
                    m.description = value;
                });
                localizationService.localize(m.referenceUrl).then(function (value) {
                    m.referenceUrl = value;
                });
            },
            initConfig: function () {
                $scope.view().configgering = true;
                if (typeof ($scope.model.value) === 'string') {
                    $scope.model.value = ($scope.model.value != '') ? JSON.parse($scope.model.value) : {};
                }
                $scope.config = function () {
                    return $scope.model.value.config;
                }
                $scope.store = function () {
                    return $scope.model.value;
                }

                $scope.view().setIcon();
                $http.get($scope.view().controller('providers')).then(function success(response) {
                    angular.forEach(response.data, function (p) {
                        $scope.view().translate(p);
                        angular.forEach(p.coordinateSystems, function (c) {
                            $scope.view().translate(c);
                        });
                    });
                    $timeout(function () {
                        $scope.view().providers = response.data;

                        if ($scope.config && $scope.config().provider && $scope.config().provider.id != null) {
                            $scope.view().setProvider($scope.config().provider.id);
                        }
                        $timeout(function () {
                            $scope.view().loading = false;
                        });
                    })
                }, function error(response) {
                    $scope.view().loading = false;
                });
            },
            loadProvider: function (id, done) {
                var wait = setInterval(function () {
                    if (!root.terratype.loading) {
                        clearInterval(wait);

                        if (!angular.isUndefined(root.terratype.providers[id])) {
                            done();
                        } else {
                            root.terratype.loading = true;
                            var script = $scope.view().urlProvider(id, 'scripts/' + id + '.js', true);
                            LazyLoad.js(script, function () {
                                $timeout(function () {
                                    if (angular.isUndefined(root.terratype.providers[id])) {
                                        throw script + ' does not define global variable root.terratype.providers[\'' + id + '\']';
                                    }
                                    root.terratype.providers[id].script = script;
                                    done(id);
                                    root.terratype.loading = false;
                                });
                            });
                        }
                    }
                }, $scope.view().poll);
            },
            setIcon: function () {
                if ($scope.config().icon && $scope.config().icon.id) {
                    $scope.view().iconPredefineChangeInternal($scope.config().icon.id);
                }
                $scope.view().iconAnchor();
                if ($scope.config().icon && !$scope.config().icon.id) {
                    $scope.view().iconCustom();
                }
            },
            setProvider: function (id) {
                var index = $scope.view().mapId($scope.view().providers, id);
                if (index == -1) {
                    //  Asked for a provider we don't have
                    return;
                }
                $scope.view().loadProvider(id, function () {
                    $scope.view().providers[index] = angular.extend($scope.view().providers[index], root.terratype.providers[id]);
                    $scope.view().providers[index].events = $scope.view().providers[index].init($scope.view().identifier, $scope.view().urlProvider,
                        $scope.store, $scope.config, $scope.view, function () {
                        $scope.$apply();
                    });
                    $scope.view().provider = $scope.view().providers[index];
                    $scope.view().provider.events.setProvider();
                    if ($scope.store().position && $scope.store().position.id != null) {
                        $scope.view().setCoordinateSystem($scope.store().position.id);
                    }
                });
            },
            setCoordinateSystem: function (id) {
                var index = $scope.view().mapId($scope.view().provider.coordinateSystems, id);
                $scope.view().position = (index != -1) ? angular.copy($scope.view().provider.coordinateSystems[index]) : { id: null, referenceUrl: null, name: null, datum: null, precision: 6 };
                if ($scope.view().configgering) {
                    $scope.store().position.precision = $scope.view().position.precision;
                }
                $scope.view().provider.events.setCoordinateSystem();
            },
            iconAnchor: function () {
                if (isNaN($scope.config().icon.anchor.horizontal)) {
                    $scope.view().icon.anchor.horizontal.isManual = false;
                    $scope.view().icon.anchor.horizontal.automatic = $scope.config().icon.anchor.horizontal;
                } else {
                    $scope.view().icon.anchor.horizontal.isManual = true;
                    $scope.view().icon.anchor.horizontal.manual = $scope.config().icon.anchor.horizontal;
                }
                if (isNaN($scope.config().icon.anchor.vertical)) {
                    $scope.view().icon.anchor.vertical.isManual = false;
                    $scope.view().icon.anchor.vertical.automatic = $scope.config().icon.anchor.vertical;
                } else {
                    $scope.view().icon.anchor.vertical.isManual = true;
                    $scope.view().icon.anchor.vertical.manual = $scope.config().icon.anchor.vertical;
                }
            },
            iconPredefineChangeInternal: function (id) {
                var index = 0;
                if (id) {
                    var index = $scope.view().mapId($scope.view().icon.predefine, id);
                    if (id == -1) {
                        index = 0;
                    }
                }
                $scope.config().icon.id = id;
                $scope.config().icon.url = $scope.view().icon.predefine[index].url;
                $scope.config().icon.size = $scope.view().icon.predefine[index].size;
                $scope.config().icon.anchor = $scope.view().icon.predefine[index].anchor;
                $scope.view().iconAnchor();
            },
            iconPredefineChange: function (id) {
                $scope.view().iconPredefineChangeInternal(id);
                $scope.view().provider.events.setIcon();
            },
            absoluteUrl: function (url) {
                if (!url) {
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
            iconCustom: function () {
                $scope.config().icon.id = $scope.view().icon.predefine[0].id;
                if (!$scope.view().icon.anchor.horizontal.isManual) {
                    switch ($scope.view().icon.anchor.horizontal.automatic) {
                        case 'left':
                            $scope.view().icon.anchor.horizontal.manual = 0;
                            break;
                        case 'center':
                            $scope.view().icon.anchor.horizontal.manual = (($scope.config().icon.size.width - 1) / 2) | 0;
                            break;
                        case 'right':
                            $scope.view().icon.anchor.horizontal.manual = $scope.config().icon.size.width - 1;
                            break;
                    }
                }
                if (!$scope.view().icon.anchor.vertical.isManual) {
                    switch ($scope.view().icon.anchor.vertical.automatic) {
                        case 'top':
                            $scope.view().icon.anchor.vertical.manual = 0;
                            break;
                        case 'center':
                            $scope.view().icon.anchor.vertical.manual = (($scope.config().icon.size.height - 1) / 2) | 0;
                            break;
                        case 'bottom':
                            $scope.view().icon.anchor.vertical.manual = $scope.config().icon.size.height - 1;
                            break;
                    }
                }
            },
            iconImageChange: function () {
                $scope.view().icon.urlFailed = '';
                $http({
                    url: $scope.view().controller('image'),
                    method: 'GET',
                    params: {
                        url: $scope.config().icon.url
                    }
                }).then(function success(response) {
                    if (response.data.status == 200) {
                        $scope.config().icon.size = {
                            width: response.data.width,
                            height: response.data.height
                        };
                        $scope.config().icon.format = response.data.format;
                    } else {
                        $scope.view().icon.urlFailed = response.data.error;
                    }
                }, function fail(response) {
                    $scope.view().icon.urlFailed = response.data;
                });
                $scope.view().iconCustom();
            },
            icon: {
                anchor: {
                    horizontal: {},
                    vertical: {}
                },
                predefine: [
                {
                    id: '',
                    name: '[Custom]',
                    url: '',
                    shadowUrl: '',
                    size: {
                        width: 32,
                        height: 32
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'bottom'
                    }
                },
                {
                    id: 'redmarker',
                    name: 'Red Marker',
                    url: 'https://mt.google.com/vt/icon/name=icons/spotlight/spotlight-poi.png',
                    shadowUrl: '',
                    size: {
                        width: 22,
                        height: 40
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'bottom'
                    }
                },
                {
                    id: 'greenmarker',
                    name: 'Green Marker',
                    url: 'https://mt.google.com/vt/icon?psize=30&font=fonts/arialuni_t.ttf&color=ff304C13&name=icons/spotlight/spotlight-waypoint-a.png&ax=43&ay=48&text=%E2%80%A2',
                    shadowUrl: '',
                    size: {
                        width: 22,
                        height: 43
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'bottom'
                    }
                },
                {
                    id: 'bluemarker',
                    name: 'Blue Marker',
                    url: 'https://mt.google.com/vt/icon/name=icons/spotlight/spotlight-waypoint-blue.png',
                    shadowUrl: '',
                    size: {
                        width: 22,
                        height: 40
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'bottom'
                    }
                },
                {
                    id: 'purplemarker',
                    name: 'Purple Marker',
                    url: 'https://mt.google.com/vt/icon/name=icons/spotlight/spotlight-ad.png',
                    shadowUrl: '',
                    size: {
                        width: 22,
                        height: 40
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'bottom'
                    }
                },
                {
                    id: 'goldstar',
                    name: 'Gold Star',
                    url: 'https://mt.google.com/vt/icon/name=icons/spotlight/star_L_8x.png&scale=2',
                    shadowUrl: '',
                    size: {
                        width: 42,
                        height: 42
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'center'
                    }
                },
                {
                    id: 'greyhome',
                    name: 'Grey Home',
                    url: 'https://mt.google.com/vt/icon/name=icons/spotlight/home_L_8x.png&scale=2',
                    shadowUrl: '',
                    size: {
                        width: 48,
                        height: 48
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'center'
                    }
                },
                {
                    id: 'redshoppingcart',
                    name: 'Red Shopping Cart',
                    url: 'https://mt.google.com/vt/icon/name=icons/spotlight/supermarket_search_L_8x.png&scale=2',
                    shadowUrl: '',
                    size: {
                        width: 48,
                        height: 48
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'center'
                    }
                },
                {
                    id: 'blueshoppingcart',
                    name: 'Blue Shopping Cart',
                    url: 'https://mt.google.com/vt/icon/name=icons/spotlight/supermarket_L_8x.png&scale=2',
                    shadowUrl: '',
                    size: {
                        width: 48,
                        height: 48
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'center'
                    }
                },
                {
                    id: 'redhotspring',
                    name: 'Red Hot Spring',
                    url: 'https://mt.google.com/vt/icon/name=icons/spotlight/jp/hot_spring_search_L_8x.png&scale=2',
                    shadowUrl: '',
                    size: {
                        width: 48,
                        height: 48
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'center'
                    }
                },
                {
                    id: 'reddharma',
                    name: 'Red Dharma',
                    url: 'https://mt.google.com/vt/icon/name=icons/spotlight/worship_dharma_search_L_8x.png&scale=2',
                    shadowUrl: '',
                    size: {
                        width: 48,
                        height: 48
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'center'
                    }
                },
                {
                    id: 'browndharma',
                    name: 'Brown Dharma',
                    url: 'https://mt.google.com/vt/icon/name=icons/spotlight/worship_dharma_L_8x.png&scale=2',
                    shadowUrl: '',
                    size: {
                        width: 48,
                        height: 48
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'center'
                    }
                },
                {
                    id: 'redjain',
                    name: 'Red Jain',
                    url: 'https://mt.google.com/vt/icon/name=icons/spotlight/worship_jain_search_L_8x.png&scale=2',
                    shadowUrl: '',
                    size: {
                        width: 48,
                        height: 48
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'center'
                    }
                },
                {
                    id: 'brownjain',
                    name: 'Brown Jain',
                    url: 'https://mt.google.com/vt/icon/name=icons/spotlight/worship_jain_L_8x.png&scale=2',
                    shadowUrl: '',
                    size: {
                        width: 48,
                        height: 48
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'center'
                    }
                },
                {
                    id: 'redshopping',
                    name: 'Red Shopping',
                    url: 'https://mt.google.com/vt/icon/name=icons/spotlight/shopping_search_L_8x.png&scale=2',
                    shadowUrl: '',
                    size: {
                        width: 48,
                        height: 48
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'center'
                    }
                },
                {
                    id: 'blueshopping',
                    name: 'Blue Shopping',
                    url: 'https://mt.google.com/vt/icon/name=icons/spotlight/shopping_L_8x.png&scale=2',
                    shadowUrl: '',
                    size: {
                        width: 48,
                        height: 48
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'center'
                    }
                },
                {
                    id: 'redharbour',
                    name: 'Red Harbour',
                    url: 'https://mt.google.com/vt/icon/name=icons/spotlight/harbour_search_L_8x.png&scale=2',
                    shadowUrl: '',
                    size: {
                        width: 48,
                        height: 48
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'center'
                    }
                },
                {
                    id: 'blueharbour',
                    name: 'Blue Harbour',
                    url: 'https://mt.google.com/vt/icon/name=icons/spotlight/harbour_L_8x.png&scale=2',
                    shadowUrl: '',
                    size: {
                        width: 48,
                        height: 48
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'center'
                    }
                },
                {
                    id: 'orangeumbraco',
                    name: 'Orange Umbraco',
                    url: Umbraco.Sys.ServerVariables.umbracoSettings.umbracoPath + '/assets/img/application/logo.png',
                    shadowUrl: '',
                    size: {
                        width: 32,
                        height: 32
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'center'
                    }
                },
                {
                    id: 'blackumbraco',
                    name: 'Black Umbraco',
                    url: Umbraco.Sys.ServerVariables.umbracoSettings.umbracoPath + '/assets/img/application/logo_black.png',
                    shadowUrl: '',
                    size: {
                        width: 32,
                        height: 32
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'center'
                    }
                },
                {
                    id: 'whiteumbraco',
                    name: 'White Umbraco',
                    url: Umbraco.Sys.ServerVariables.umbracoSettings.umbracoPath + '/assets/img/application/logo_white.png',
                    shadowUrl: '',
                    size: {
                        width: 32,
                        height: 32
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'center'
                    }
                },
                {
                    id: 'redcircle',
                    name: 'Red Circle',
                    url: 'https://mt.google.com/vt/icon/name=icons/spotlight/generic_search_L_8x.png&scale=2',
                    shadowUrl: '',
                    size: {
                        width: 48,
                        height: 48
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'center'
                    }
                },
                {
                    id: 'orangecircle',
                    name: 'Orange Circle',
                    url: 'https://mt.google.com/vt/icon/name=icons/spotlight/ad_L_8x.png&scale=2',
                    shadowUrl: '',
                    size: {
                        width: 48,
                        height: 48
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'center'
                    }
                },
                {
                    id: 'browncircle',
                    name: 'Brown Circle',
                    url: 'https://mt.google.com/vt/icon/name=icons/spotlight/generic_establishment_v_L_8x.png&scale=2',
                    shadowUrl: '',
                    size: {
                        width: 48,
                        height: 48
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'center'
                    }
                },
                {
                    id: 'greencircle',
                    name: 'Green Circle',
                    url: 'https://mt.google.com/vt/icon/name=icons/spotlight/generic_recreation_v_L_8x.png&scale=2',
                    shadowUrl: '',
                    size: {
                        width: 48,
                        height: 48
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'center'
                    }
                },
                {
                    id: 'bluecircle',
                    name: 'Blue Circle',
                    url: 'https://mt.google.com/vt/icon/name=icons/spotlight/generic_retail_v_L_8x.png&scale=2',
                    shadowUrl: '',
                    size: {
                        width: 48,
                        height: 48
                    },
                    anchor: {
                        horizontal: 'center',
                        vertical: 'center'
                    }
                },
                ]
            },
            initEditor: function () {
                $scope.view().error = false;
                try {
                    if (typeof ($scope.model.value) === 'string') {
                        $scope.model.value = ($scope.model.value != '') ? JSON.parse($scope.model.value) : null;
                    }
                    if (!$scope.model.value) {
                        $scope.model.value = {};
                    }
                }
                catch (oh) {
                    //  Can't even read our own values
                    $scope.model.value = {};
                }
                try {
                    $scope.config = function () {
                        return $scope.model.config.definition.config;
                    }
                    $scope.store = function () {
                        return $scope.model.value;
                    }
                    if (!$scope.store().zoom) {
                        $scope.store().zoom = $scope.model.config.definition.zoom;
                    }
                    if (!$scope.store().position || !$scope.store().position.id || !$scope.store().position.datum) {
                        $scope.store().position = {
                            id: $scope.model.config.definition.position.id,
                            datum: $scope.model.config.definition.position.datum
                        }
                        done();
                    } else if ($scope.store().position.id != $scope.model.config.definition.position.id) {
                        //  Convert coords from old system to new
                        $http({
                            url: $scope.view().controller('convertcoordinatesystem'),
                            method: 'GET',
                            params: {
                                sourceId: $scope.store().position.id,
                                sourceDatum: $scope.store().position.datum,
                                destinationId: $scope.model.config.definition.position.id
                            }
                        }).then(function success(response) {
                            $scope.store().position.datum = response.data;
                            $scope.store().position.id = $scope.model.config.definition.position.id;
                            done();
                        });
                    } else {
                        done();
                    }
                    function done () {
                        $scope.view().loadProvider($scope.config().provider.id, function () {
                            $scope.view().isPreview = !angular.isUndefined($scope.model.sortOrder);
                            $scope.view().provider = angular.copy(root.terratype.providers[$scope.config().provider.id]);
                            var position = angular.copy($scope.store().position);
                            position.precision = $scope.model.config.definition.position.precision;
                            $scope.view().provider.coordinateSystems = [];
                            $scope.view().provider.coordinateSystems.push(position);
                            $scope.view().position = angular.copy(position);
                            $scope.view().loading = false;
                            setTimeout(function () {
                                //  Simple way to wait for any destroy to have finished
                                $scope.view().provider.events = $scope.view().provider.init($scope.view().identifier, $scope.view().urlProvider,
                                    $scope.store, $scope.config, $scope.view, function () {
                                    $scope.$apply();
                                });
                            }, 150);
                        });
                    }
                }
                catch (oh) {
                    //  Error so might as well show debug
                    $scope.view().error = true;
                    $scope.config().debug = 1;
                }
            }
        }
    }]);
}(window));
