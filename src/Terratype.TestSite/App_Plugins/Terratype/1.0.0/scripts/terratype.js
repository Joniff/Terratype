(function (root) {

    if (!root.terratype) {
        root.terratype = {
            loading: false,
            providers: {}
        };
    }

    angular.module('umbraco').controller('terratype', ['$scope', '$timeout', '$http', '$injector', function ($scope, $timeout, $http, $injector) {
        $scope.identifier = $scope.$id;
        $scope.urlRoot = '/App_Plugins/Terratype/1.0.0/';
        $scope.error = null;
        $scope.poll = 250;
        $scope.mapId = function (array, id) {
            for (var i = 0; i != array.length; i++) {
                if (array[i].id == id) {
                    return i;
                }
            }
            return -1;
        },
        $scope.files = function (value, id) {
            value.logo = $scope.urlRoot + 'images/' + id + '/' + id + '-Logo.png';
            value.mapExample = $scope.urlRoot + 'images/' + id + '/' + id + '-Example.png';
            value.views = {
                config: {
                    definition: $scope.urlRoot + 'views/' + id + '/config.definition.html',
                    apperance: $scope.urlRoot + 'views/' + id + '/config.apperance.html',
                    search: $scope.urlRoot + 'views/' + id + '/config.search.html'
                },
                editor: {
                    apperance: $scope.urlRoot + 'views/' + id + '/editor.apperance.html'
                }
            };
        }
        $scope.initConfig = function () {
            if (typeof ($scope.model.value) === 'string') {
                $scope.model.value = ($scope.model.value != '') ? JSON.parse($scope.model.value) : {};
            }
            $http.get('/umbraco/backoffice/terratype/provider/providers').then(function success(response) {
                $scope.bag.providers = response.data;
                if ($scope.model.value) {
                    if ($scope.model.value.provider && $scope.model.value.provider.id != null) {
                        $scope.setProvider($scope.model.value.provider.id);
                    }
                }
            }, function error(response) {
                $scope.error = '<b>Unable to retrieve providers</b><br />' + response.data;
            });
        }
        $scope.loadProvider = function (id, done) {
            var wait = setInterval(function () {
                if (!root.terratype.loading) {
                    clearInterval(wait);

                    if (!angular.isUndefined(root.terratype.providers[id])) {
                        done(id);
                    } else {
                        root.terratype.loading = true;
                        var script = $scope.urlRoot + 'scripts/' + id + '/' + id + '.js';
                        LazyLoad.js(script, function () {
                            $timeout(function () {
                                if (angular.isUndefined(root.terratype.providers[id])) {
                                    throw script + ' does not define global variable root.terratype.providers[\'' + id + '\']';
                                }
                                root.terratype.providers[id].script = script;
                                $scope.files(root.terratype.providers[id], id);
                                done(id);
                                root.terratype.loading = false;
                            });
                        });
                    }
                }
            }, $scope.poll);
        }

        $scope.setProvider = function (id, done) {
            var index = $scope.mapId($scope.bag.providers, id);
            if (index == -1) {
                //  Asked for a provider we don't have
                return;
            }
            $scope.loadProvider(id, function () {
                var provider = angular.copy(root.terratype.providers[id]);
                $timeout(function () {
                    if (!provider.init) {
                        throw provider.script + ' does not define init()';
                    }
                    provider.init($scope, $timeout);
                    angular.extend($scope.bag.providers[index], provider);
                    $scope.bag.provider = $scope.bag.providers[index];
                    $scope.bag.provider.loaded = true;

                    if ($scope.model.value.icon && $scope.model.value.icon.id) {
                        $scope.iconPredefineChangeInternal($scope.model.value.icon.id);
                    }
                    $scope.iconAnchor();
                    if ($scope.model.value.icon && !$scope.model.value.icon.id) {
                        $scope.iconCustom();
                    }

                    $scope.bag.provider.reinit.call($scope.bag.provider);
                    $scope.$broadcast('setProvider', $scope.bag.provider);
                    if ($scope.model.value && $scope.model.value.position && $scope.model.value.position.id != null) {
                        $scope.setCoordinateSystems($scope.model.value.position.id);
                    }
                });
            });
        }

        $scope.setCoordinateSystems = function (id) {
            var index = $scope.mapId($scope.bag.provider.coordinateSystems, id);
            $scope.bag.position = (index != -1) ? $scope.bag.provider.coordinateSystems[index] : { id: null, referenceUrl: null, name: null, datum: null };
            $scope.$broadcast('setCoordinateSystem', $scope.bag.provider);
        };
        $scope.iconAnchor = function () {
            if (isNaN($scope.model.value.icon.anchor.horizontal)) {
                $scope.bag.icon.anchor.horizontal.isManual = false;
                $scope.bag.icon.anchor.horizontal.automatic = $scope.model.value.icon.anchor.horizontal;
            } else {
                $scope.bag.icon.anchor.horizontal.isManual = true;
                $scope.bag.icon.anchor.horizontal.manual = $scope.model.value.icon.anchor.horizontal;
            }
            if (isNaN($scope.model.value.icon.anchor.vertical)) {
                $scope.bag.icon.anchor.vertical.isManual = false;
                $scope.bag.icon.anchor.vertical.automatic = $scope.model.value.icon.anchor.vertical;
            } else {
                $scope.bag.icon.anchor.vertical.isManual = true;
                $scope.bag.icon.anchor.vertical.manual = $scope.model.value.icon.anchor.vertical;
            }
        },
        $scope.iconPredefineChangeInternal = function (id) {
            var index = 0;
            if (id) {
                var index = $scope.mapId($scope.bag.icon.predefine, id);
                if (id == -1) {
                    index = 0;
                }
            }
            $scope.model.value.icon.id = id;
            $scope.model.value.icon.url = $scope.bag.icon.predefine[index].url;
            $scope.model.value.icon.size = $scope.bag.icon.predefine[index].size;
            $scope.model.value.icon.anchor = $scope.bag.icon.predefine[index].anchor;
            $scope.iconAnchor();
        };
        $scope.iconPredefineChange = function (id) {
            $scope.iconPredefineChangeInternal(id);
            $scope.$broadcast('setIcon', $scope.bag.provider);
        };
        $scope.absoluteUrl = function (url) {
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
        };
        $scope.iconCustom = function () {
            $scope.model.value.icon.id = $scope.bag.icon.predefine[0].id;
            if (!$scope.bag.icon.anchor.horizontal.isManual) {
                switch($scope.bag.icon.anchor.horizontal.automatic) {
                    case 'left':
                        $scope.bag.icon.anchor.horizontal.manual = 0;
                        break;
                    case 'center':
                        $scope.bag.icon.anchor.horizontal.manual = (($scope.model.value.icon.size.width - 1) / 2) | 0;
                        break;
                    case 'right':
                        $scope.bag.icon.anchor.horizontal.manual = $scope.model.value.icon.size.width - 1;
                        break;
                }
            }
            if (!$scope.bag.icon.anchor.vertical.isManual) {
                switch ($scope.bag.icon.anchor.vertical.automatic) {
                    case 'top':
                        $scope.bag.icon.anchor.vertical.manual = 0;
                        break;
                    case 'center':
                        $scope.bag.icon.anchor.vertical.manual = (($scope.model.value.icon.size.height - 1) / 2) | 0;
                        break;
                    case 'bottom':
                        $scope.bag.icon.anchor.vertical.manual = $scope.model.value.icon.size.height - 1;
                        break;
                }
            }
        }

        $scope.iconImageChange = function () {
            $scope.bag.icon.urlFailed = '';
            $http({
                url: '/umbraco/backoffice/terratype/provider/image',
                method: 'GET',
                params: {
                    url: $scope.model.value.icon.url
                }
            }).then(function success(response) {
                if (response.data.status == 200) {
                    $scope.model.value.icon.size = {
                        width: response.data.width,
                        height: response.data.height
                    };
                    $scope.model.value.icon.format = response.data.format;
                } else {
                    $scope.bag.icon.urlFailed = response.data.error;
                }
            }, function fail(response) {
                $scope.bag.icon.urlFailed = response.data;
            });
            $scope.iconCustom();
        };
        $scope.bag = {
            provider: {
                id: null,
                referenceUrl: null,
                name: null
            },
            providers: [],
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
                    url: '/umbraco/assets/img/application/logo.png',
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
                    url: '/umbraco/assets/img/application/logo_black.png',
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
                    url: '/umbraco/assets/img/application/logo_white.png',
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
            }
        }

        if (!$injector.has('jsonTextDirective')) {
            angular.module('umbraco').directive('jsonText', function () {
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

                                // TODO avoid this causing the focus of the input to be lost..
                                ngModelCtrl.$render();
                            }
                        }, true); // MUST use objectEquality (true) here, for some reason..

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
        }

        $scope.initEditor = function () {
            try {
                $scope.error = false;
                if (typeof ($scope.model.value) === 'string') {
                    $scope.model.value = ($scope.model.value != '') ? JSON.parse($scope.model.value) : null;
                }
                if (!$scope.model.value) {
                    $scope.model.value = $scope.model.config.definition;
                }
                //  Always get debug flag from config
                $scope.model.value.debug = $scope.model.config.definition.debug;
                $scope.bag.isPreview = !angular.isUndefined($scope.model.sortOrder);

                $scope.bag.providers = [];
                $scope.bag.providers.push($scope.model.value.provider);
                $scope.bag.providers[0].coordinateSystems = [];
                $scope.bag.providers[0].coordinateSystems.push($scope.model.value.position);
                if ($scope.model.value && $scope.model.value.provider && $scope.model.value.provider.id != null) {
                    if ($scope.bag.isPreview) {
                        $scope.files($scope.bag.provider, $scope.model.value.provider.id);
                    } else {
                        $scope.setProvider($scope.model.value.provider.id);
                    }
                }
            }
            catch (oh) {
                //  Error so might as well show debug
                $scope.error = true;
                $scope.debug = 1;
            }
        }
    }]);
}(window));
