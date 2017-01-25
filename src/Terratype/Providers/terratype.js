(function (root) {
    root.terratypeProvider = {};
    angular.module('umbraco').controller('terratype', ['$scope', '$timeout', '$http', '$injector', function ($scope, $timeout, $http, $injector) {
        $scope.identifier = $scope.$id;
        $scope.urlRoot = '/App_Plugins/Terratype/1.0.0/';
        $scope.error = null;
        $scope.loading = 0;
        $scope.initConfig = function () {
            $scope.loading++;
            if (typeof ($scope.model.value) == 'string') {
                $scope.model.value = JSON.parse($scope.model.value);
            }
            $http.get('/umbraco/backoffice/terratype/provider/providers').then(function success(response) {
                $scope.loading--;
                $scope.bag.providers = response.data;
                angular.forEach($scope.bag.providers, function (value, key) {
                    value.image = $scope.urlRoot + 'images/' + value.id + '/' + value.id + '.png';
                    value.views = {
                        definition: $scope.urlRoot + 'views/' + value.id + '/config.definition.html',
                        apperance: $scope.urlRoot + 'views/' + value.id + '/config.apperance.html',
                        search: $scope.urlRoot + 'views/' + value.id + '/config.search.html',
                    };
                    value.script = $scope.urlRoot + 'scripts/' + value.id + '/' + value.id + '.js';
                });

                if ($scope.model.value && $scope.model.value.provider && $scope.model.value.provider.id != null) {
                    $scope.setProvider($scope.model.value.provider.id);
                }
                if ($scope.model.value.icon && $scope.model.value.icon.id) {
                    $scope.iconPredefineChangeInternal($scope.model.value.icon.id);
                }
            }, function error(response) {
                $scope.loading--;
                $scope.error = '<b>Unable to retrieve providers</b><br />' + response.data;
            });
        }
        $scope.setProvider = function (id) {
            set = function (index) {
                $scope.bag.provider = $scope.bag.providers[index];
                $scope.bag.provider.reinit.call($scope.bag.provider);
                $scope.$broadcast('setProvider', $scope.bag.provider);
                if ($scope.model.value && $scope.model.value.position && $scope.model.value.position.id != null) {
                    $scope.setCoordinateSystems($scope.model.value.position.id);
                }
            }

            var index = $scope.bag.providers.map(function (x) { return x.id; }).indexOf(id);
            if (index == -1) {
                $scope.bag.provider = { id: null, referenceUrl: null, name: null };
                return;
            }
            if (angular.isUndefined(root.terratypeProvider) || angular.isUndefined(root.terratypeProvider[id])) {
                $scope.loading++;
                LazyLoad.js($scope.bag.providers[index].script, function () {
                    $timeout(function () {
                        $scope.loading--;
                        if (angular.isUndefined(root.terratypeProvider[id])) {
                            throw $scope.bag.providers[index].script + ' does not define global variable root.terratypeProvider[\'' + id + '\']';
                        }
                        var provider = angular.copy(root.terratypeProvider[id]);
                        if (angular.isUndefined(provider.init)) {
                            throw $scope.bag.providers[index].script + ' does not define init()';
                        }
                        provider.init($scope, $timeout);
                        angular.extend($scope.bag.providers[index], provider);
                        set(index);
                    });
                });
            } else {
                var provider = angular.copy(root.terratypeProvider[id]);
                provider.init($scope, $timeout);
                angular.extend($scope.bag.providers[index], provider);
                set(index);
            }
        };

        $scope.setCoordinateSystems = function (id) {
            var index = $scope.bag.provider.coordinateSystems.map(function (x) { return x.id; }).indexOf(id);
            $scope.bag.position = (index != -1) ? $scope.bag.provider.coordinateSystems[index] : { id: null, referenceUrl: null, name: null, datum: null };
            $scope.$broadcast('setCoordinateSystem', $scope.bag.provider);
        };
        $scope.iconPredefineChangeInternal = function (id) {
            var index = 0;
            if (id) {
                var index = $scope.bag.icon.predefine.map(function (x) { return x.id; }).indexOf(id);
                if (id == -1) {
                    index = 0;
                }
            }
            $scope.model.value.icon.id = id;
            $scope.model.value.icon.url = $scope.bag.icon.predefine[index].url;
            $scope.model.value.icon.size = $scope.bag.icon.predefine[index].size;
            $scope.model.value.icon.anchor = $scope.bag.icon.predefine[index].anchor;
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
        }

        $scope.iconImageChange = function () {

            $http.get('/umbraco/backoffice/terratype/provider/test2').then(function success(response) {
                alert(response.data);
            });


            //$http.get('/umbraco/backoffice/terratype/provider/image', {
            //    url: $scope.model.value.icon.url
            //}).then(function success(response) {
            //    $scope.model.value.size.width = response.data.width;
            //    $scope.model.value.size.height = response.data.height;
            //});
            //$scope.iconCustom();
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
    }]);


    //  Pollyfill indexOf
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement, fromIndex) {
            var k;

            // 1. Let O be the result of calling ToObject passing
            //    the this value as the argument.
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var O = Object(this);

            // 2. Let lenValue be the result of calling the Get
            //    internal method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            var len = O.length >>> 0;

            // 4. If len is 0, return -1.
            if (len === 0) {
                return -1;
            }

            // 5. If argument fromIndex was passed let n be
            //    ToInteger(fromIndex); else let n be 0.
            var n = +fromIndex || 0;

            if (Math.abs(n) === Infinity) {
                n = 0;
            }

            // 6. If n >= len, return -1.
            if (n >= len) {
                return -1;
            }

            // 7. If n >= 0, then Let k be n.
            // 8. Else, n<0, Let k be len - abs(n).
            //    If k is less than 0, then let k be 0.
            k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            // 9. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ToString(k).
                //   This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the
                //    HasProperty internal method of O with argument Pk.
                //   This step can be combined with c
                // c. If kPresent is true, then
                //    i.  Let elementK be the result of calling the Get
                //        internal method of O with the argument ToString(k).
                //   ii.  Let same be the result of applying the
                //        Strict Equality Comparison Algorithm to
                //        searchElement and elementK.
                //  iii.  If same is true, return k.
                if (k in O && O[k] === searchElement) {
                    return k;
                }
                k++;
            }
            return -1;
        };
    }
}(window));
