angular.module("umbraco")
    .directive('sliderrevolutioncolorpickertoggle', ['$document', '$location', '$window', function ($document, $location, $window) {
        var openElement = null,
            closeMenu = angular.noop;
        return {
            restrict: 'CA',
            link: function (scope, element, attrs) {
                scope.$watch('$location.path', function () {
                    closeMenu();
                });
                element.bind('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    var elementWasOpen = (element === openElement);
                    if (!!openElement) {
                        closeMenu();
                    }
                    if (!elementWasOpen) {

                        element.parent().addClass('open');
                        openElement = element;
                        closeMenu = function (event) {
                            if (event == undefined || !event.target.hasAttribute("sliderrevolutioncolorpickerdrawing")) {
                                if (event) {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }
                                $document.unbind('click', closeMenu);
                                element.parent().removeClass('open');
                                closeMenu = angular.noop;
                                openElement = null;
                            }
                        };
                        $document.bind('click', closeMenu);
                    }
                });
            }
        };
    }])
    .directive("sliderrevolutioncolorpickerdrawing", function () {
        return {
            restrict: 'A',
            scope: {
                color: '=',
            },
            replace: true,
            link: function (scope, element) {
						
                scope.$watch(function () {
                    return scope.color;
                }, function (modelValue) {
                    createPicker(element[0], 100, '#fff', null);
                });

                createPicker(element[0], 100, '#fff', null);

                function createPicker(canvas, size, arrowColor) {

                    var SIZE = size;
                    //var canvas = document.createElement('canvas');
                    canvas.height = SIZE + 14; // 7px paddings
                    canvas.width = SIZE + 14 + 40; // 20px-width saturation line with 10px paddings
                    var ctx = canvas.getContext('2d');

                    var gradCanvas = document.createElement('canvas');
                    gradCanvas.width = gradCanvas.height = SIZE;
                    var gradCtx = gradCanvas.getContext('2d');
                    var whiteGrad = ctx.createLinearGradient(0, 0, SIZE, 0);
                    whiteGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    whiteGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
                    var blackGrad = ctx.createLinearGradient(0, SIZE, 0, 0);
                    blackGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    blackGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
                    gradCtx.fillStyle = whiteGrad;
                    gradCtx.fillRect(0, 0, SIZE, SIZE);
                    gradCtx.fillStyle = blackGrad;
                    gradCtx.fillRect(0, 0, SIZE, SIZE);

                    var cur = {
                        hue: 0,
                        sat: 100,
                        val: 100,
                        tool: null
                    };

                    if (scope.color) {
                        
                        var val = tinycolor(scope.color).toHsv();
                        cur.hue = val.h;
                        cur.sat = val.v * 100;
                        cur.val = val.s * 100;
                    }

                    function redrawSVMap() {
                        ctx.clearRect(0, 0, SIZE + 14, SIZE + 14);
                        ctx.fillStyle = 'rgb(' + hsvToRgb(cur.hue, 100, 100) + ')';
                        ctx.fillRect(7, 7, SIZE, SIZE);
                        ctx.drawImage(gradCanvas, 7, 7, SIZE, SIZE);
                        drawCircle();
                    }

                    function drawCircle() {
                        var x = SIZE * (cur.val / 100) + 7;
                        var y = SIZE - SIZE * (cur.sat / 100) + 7;
                        for (var i = 0, colors = ['#000', '#fff']; i < 2; i++) {
                            ctx.strokeStyle = colors[i];
                            ctx.beginPath();
                            ctx.arc(x, y, 5 - i, 0, Math.PI * 2);
                            ctx.stroke();
                        }
                    }

                    function drawHLine() {
                        var hue = [[255, 0, 0], [255, 255, 0], [0, 255, 0], [0, 255, 255], [0, 0, 255], [255, 0, 255], [255, 0, 0]];
                        var grad = ctx.createLinearGradient(7, 7, 7, SIZE + 14);
                        for (var i = 0; i <= 6; i++) {
                            var color = 'rgb(' + hue[i][0] + ',' + hue[i][1] + ',' + hue[i][2] + ')';
                            grad.addColorStop(1 - i * 1 / 6, color);
                        }
                        ctx.fillStyle = grad;
                        ctx.fillRect(SIZE + 14 + 10, 7, 20, SIZE);
                    }

                    function redrawArrows() {
                        var y = !cur.hue ? 7 : SIZE - cur.hue / 360 * SIZE + 7;
                        ctx.clearRect(SIZE + 14, 0, 10, SIZE + 14);
                        ctx.clearRect(SIZE + 14 + 10 + 20, 0, 10, SIZE + 14);
                        ctx.fillStyle = '#000000';
                        ctx.fillStyle = arrowColor;
                        for (var i = 0; i < 2; i++) {
                            ctx.beginPath();
                            ctx.moveTo(SIZE + 14 + 9 + 22 * i, y);
                            ctx.lineTo(SIZE + 14 + 3 + 34 * i, y - 5);
                            ctx.lineTo(SIZE + 14 + 3 + 34 * i, y + 5);
                            ctx.closePath();
                            ctx.fill();
                        }
                    }

                    function mouseDown(evt) {
                        var offset = canvas.getBoundingClientRect();
                        var x = evt.clientX - offset.left;
                        var y = evt.clientY - offset.top;

                        if (x >= 7 && x <= SIZE + 7 && y >= 7 && y <= SIZE + 7) {
                            x -= 7;
                            y -= 7;
                            cur.tool = 'SV';
                            cur.val = x / SIZE * 100;
                            cur.sat = (SIZE - y) / SIZE * 100;
                            redrawSVMap();
                            scope.color = tinycolor('hsv ' + cur.hue + ', ' + cur.val + '%, ' + cur.sat + '%').toHexString();
                        }

                        if (x >= SIZE + 14 + 10 && x <= SIZE + 14 + 10 + 20 && y >= 7 && y <= SIZE + 7) {
                            y -= 7;
                            cur.tool = 'H';
                            cur.hue = ((SIZE - y) / SIZE * 360) % 360;
                            redrawSVMap();
                            redrawArrows();
                            scope.color = tinycolor('hsv ' + cur.hue + ', ' + cur.val + '%, ' + cur.sat + '%').toHexString();
                        }

                        document.body.addEventListener('mousemove', mouseMove);
                        document.body.addEventListener('mouseup', mouseUp);
                    }

                    function mouseMove(evt) {
                        var offset = canvas.getBoundingClientRect();
                        var x = evt.clientX - offset.left;
                        var y = evt.clientY - offset.top;

                        if (cur.tool === 'SV') {
                            x = x < 7 ? 7 : (x > SIZE + 7 ? SIZE + 7 : x);
                            y = y < 7 ? 7 : (y > SIZE + 7 ? SIZE + 7 : y);
                            x -= 7;
                            y -= 7;
                            cur.val = x / SIZE * 100;
                            cur.sat = (SIZE - y) / SIZE * 100;
                            redrawSVMap();
                            scope.color = tinycolor('hsv ' + cur.hue + ', ' + cur.val + '%, ' + cur.sat + '%').toHexString();
                        }

                        if (cur.tool === 'H') {
                            y = y < 7 ? 7 : (y > SIZE + 7 ? SIZE + 7 : y);
                            y -= 7;
                            cur.hue = ((SIZE - y || 1) / SIZE * 360) % 360;
                            redrawSVMap();
                            redrawArrows();
                            scope.color = tinycolor('hsv ' + cur.hue + ', ' + cur.val + '%, ' + cur.sat + '%').toHexString();
                        }
                    }

                    function mouseUp(evt) {
                        document.body.removeEventListener('onmousemove', mouseMove);
                        document.body.removeEventListener('mouseup', mouseUp);
                        cur.tool = null;
                    }

                    canvas.addEventListener('mousedown', mouseDown);

                    drawHLine();
                    redrawArrows();
                    redrawSVMap();

                    return canvas;

                }

                function hsvToRgb(h, s, v) {
                    var f, p, q, t, lH, r, g, b;
                    s /= 100;
                    v /= 100;
                    lH = Math.floor(h / 60);
                    f = h / 60 - lH;
                    p = v * (1 - s);
                    q = v * (1 - s * f);
                    t = v * (1 - (1 - f) * s);
                    switch (lH) {
                        case 0: r = v; g = t; b = p; break;
                        case 1: r = q; g = v; b = p; break;
                        case 2: r = p; g = v; b = t; break;
                        case 3: r = p; g = q; b = v; break;
                        case 4: r = t; g = p; b = v; break;
                        case 5: r = v; g = p; b = q; break;
                    }
                    return [parseInt(r * 255), parseInt(g * 255), parseInt(b * 255)];
                }

            }
        };
    })
