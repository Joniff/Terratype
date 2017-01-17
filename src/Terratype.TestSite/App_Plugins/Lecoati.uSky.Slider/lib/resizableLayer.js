angular.module("umbraco").
    directive('resizableLayer', [function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs, controller) {
                var previousFontSize;

                scope.$watch(function () {
                    return element[0].clientHeight > 0;
                }, function (newValue, oldValue) {
                    if (element[0].clientHeight > 0) {
                        scope.layer.width = element[0].clientWidth;
                        scope.layer.height = element[0].clientHeight;
                    }
                });

                scope.$watch(function () {
                    return  scope.layer.fontSize;
                }, function (newValue, oldValue) {
                    if (!(scope.$parent.$parent.resizing === true)) {
                        var scaleFactor = newValue / oldValue;

                        console.log("Font Changed: " + newValue);

                        scope.layer.width = scope.layer.width * scaleFactor;
                        scope.layer.height = scope.layer.height * scaleFactor;
                    }
                });

                scope.$watch(function () {
                    return scope.layer.padding;
                }, function (newValue, oldValue) {
                    if (!(scope.$parent.$parent.resizing === true)) {
                        console.log("Padding Changed: " + newValue);

                        scope.layer.width = scope.layer.width - oldValue * 2 + newValue * 2;
                        scope.layer.height = scope.layer.height - oldValue * 2 + newValue * 2;
                    }
                });

                scope.$watch(function () {
                    return scope.layer.content;
                }, function (newValue, oldValue) {
                    if (!(scope.$parent.$parent.resizing === true)) {
                        console.log("Content changed: " + newValue);

                        scope.layer.width = "";
                        scope.layer.height = "";
                    }
                });

                scope.$watch(function () {
                    return element[0].offsetWidth;
                }, function (val) {
                    if (scope.layer.width == "") {
                        console.log("offset changed: " + val);

                        scope.layer.width = element[0].offsetWidth;
                        scope.layer.height = element[0].offsetHeight;
                    }
                    //TODO: write code here, slit wrists, etc. etc.
                });
            }
        };
    }]);