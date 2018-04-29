(function (root) {

	angular.module('umbraco').controller('terratypelistview', ['$scope', '$timeout', '$http', 'localizationService', 
		function ($scope, $timeout, $http, localizationService) {

		var vm = angular.extend(this, {
			loading: true,
			datatypes: [],
			config: function () {
				return $scope.model.value;
			},
			images: {
				loading: Umbraco.Sys.ServerVariables.umbracoSettings.umbracoPath + '/assets/img/loader.gif',
				failed: Umbraco.Sys.ServerVariables.umbracoSettings.umbracoPath + '/images/false.png',
				success: Umbraco.Sys.ServerVariables.umbracoSettings.umbracoPath + '/images/true.png',
			},
			controller: function (a) {
				return Umbraco.Sys.ServerVariables.umbracoSettings.umbracoPath + '/backoffice/Terratype/ajax/' + a;
			},
			init: function () {
				if (typeof ($scope.model.value) === 'string') {
					$scope.model.value = ($scope.model.value != '') ? JSON.parse($scope.model.value) : {};
				}

				$http.get($scope.vm.controller('datatypes')).then(function success(response) {
					vm.datatypes = response.data;
					vm.loading = false;
				});
			}
		});

    }]);

}(window));
