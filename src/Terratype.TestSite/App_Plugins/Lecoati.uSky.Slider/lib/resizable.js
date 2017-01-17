angular.module("umbraco").
    directive('resizable', function () {
        return {
            restrict: 'A',
            scope: {
                layer: '=',
            },
            replace: true,
            link: function (scope, element, attrs) {
                
            }
        };
    });