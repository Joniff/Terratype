(function (root) {
    root.terratypeProvider = {};
    angular.module('umbraco').controller('terratype', ['$scope', '$timeout', '$http', '$injector', function ($scope, $timeout, $http, $injector) {
        $scope.urlRoot = '/App_Plugins/Terratype/1.0.0/';
        $scope.error = null;
        $scope.loading = 0;
        $scope.bag = { provider: { id: null, referenceUrl: null, name: null } };
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

                if (!angular.isUndefined($scope.model.value) && $scope.model.value != null &&
                    !angular.isUndefined($scope.model.value.provider) && $scope.model.value.provider != null &&
                    !angular.isUndefined($scope.model.value.provider.id) && $scope.model.value.provider.id != null) {
                    $scope.setProvider($scope.model.value.provider.id);
                }

            }, function error(response) {
                $scope.loading--;
                $scope.error = '<b>Unable to retrieve providers</b><br />' + response.data;
            });
        }
        $scope.setProvider = function (id) {
            var index = $scope.bag.providers.map(function (x) { return x.id; }).indexOf(id);
            if (index == -1) {
                $scope.bag.provider = { id: null, referenceUrl: null, name: null };
                return;
            }
            if (angular.isUndefined(root.terratypeProvider[id])) {
                $scope.loading++;
                LazyLoad.js($scope.bag.providers[index].script, function () {
                    $timeout(function () {
                        $scope.loading--;
                        if (angular.isUndefined(root.terratypeProvider[id])) {
                            throw $scope.bag.providers[index].script + ' does not define global variable root.terratypeProvider[\'' + id + '\']';
                        }
                        var e = root.terratypeProvider[id];
                        angular.extend($scope.bag.providers[index], e);
                    });
                });
            }
            $scope.bag.provider = $scope.bag.providers[index];
        }

        $scope.setCoordinateSystems = function (id) {
            var index = $scope.bag.provider.coordinateSystems.map(function (x) { return x.id; }).indexOf(id);
            $scope.bag.position = (index != -1) ? $scope.bag.provider.coordinateSystems[index] : { id: null, referenceUrl: null, name: null, datum: null };
        }
    }]);


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
