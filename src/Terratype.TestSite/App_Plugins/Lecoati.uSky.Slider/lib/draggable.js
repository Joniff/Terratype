angular.module("umbraco").
    directive('draggable', function () {
        return {
            restrict: 'A',
            scope: {
                layer: '=',
                handlerClick: '&ngClick',
                handlerMouseOver: '&ngMouseover',
                handlerMouseLeave: '&ngMouseleave',
                condition: '=',
                aspectratio: '=',
                resize: '='
            },
            link: function (scope, element, attrs) {
                scope.$watch(function () {
                    return scope.layer;
                }, function (modelValue) {

                    element.draggable({
                        snap: false,
                        revert: false,
                        //containment: "parent",
                        scroll: false,
                        cursor: "move",
                        distance: 10,
                        cancel: ".text",
                        stop: function (event, ui) {
                            scope.layer.dataX = ui.position.left;
                            scope.layer.dataY = ui.position.top;
                        }
                    })

                    if (scope.resize) {
                        element.resizable({
                            //containment: "parent",
                            aspectRatio: scope.aspectratio,
                            stop: function (event, ui) {
                                scope.layer.dataX = ui.position.left;
                                scope.layer.dataY = ui.position.top;
                                scope.layer.width = ui.size.width;
                                scope.layer.height = ui.size.height;
                            }
                        });
                    }

                    element.css({ 'top': scope.layer.dataY, 'left': scope.layer.dataX, 'width': scope.layer.width + "px", 'height': scope.layer.height + "px" });
                });
                //scope.$watch('condition', function (condition) {
                //    if (condition) {
                //        element.css('border-color', 'rgb(243, 243, 8)');
                //    }
                //    else {
                //        element.css('border-color', 'transparent');
                //    };
                //});



            }
        };
    });