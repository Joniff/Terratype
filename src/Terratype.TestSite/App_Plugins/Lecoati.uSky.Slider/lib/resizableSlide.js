angular.module("umbraco").
    directive('resizableSlide', [function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs, controller) {
                scope.$watch(function () {
                    return (element[0].offsetHeight > 0).toString() + element[0].offsetHeight.toString();
                }, function (newValue, oldValue) {
                    if (element[0].offsetHeight > 0) {
                        scope.fluidHeight = parseInt(element[0].offsetHeight, 10);
                        scope.fluidWidth = parseInt(element[0].offsetWidth, 10);

                        scope.model.value.forEach(function (slide) {
                            var scaleFactor = scope.fluidWidth / slide.previousParentWidth;

                            slide.layers.forEach(function (layer) {
                                layer.dataX = layer.dataX * scaleFactor;
                                layer.dataY = layer.dataY * scaleFactor;

                                layer.padding = layer.padding * scaleFactor;
                                layer.fontSize = layer.fontSize * scaleFactor;

                                if (layer.type == "image") {
                                    layer.width = layer.width * scaleFactor;
                                    layer.height = layer.height * scaleFactor;
                                }
                            });

                            slide.previousParentWidth = scope.fluidWidth;
                            slide.previousParentHeight = scope.fluidHeight;
                        });
                    }
                });
            }
        }
    }]);