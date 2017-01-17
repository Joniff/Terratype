angular.module("umbraco")
    .controller("uSky.Slider.controller",
    function ($scope, $http, assetsService, $rootScope, dialogService, mediaResource, imageHelper, $timeout, $window) {

        // Text default sizes
        $scope.sizes = ["9", "10", "11", "12", "13", "14", "16", "18", "24", "28", "36", "48", "64", "72"];

        // Slide transition
        $scope.dataTransition = [
            "random",
            "boxslide",
            "boxfade",
            "slotzoom-horizontal",
            "slotslide-horizontal",
            "slotfade-horizontal",
            "slotzoom-vertical",
            "slotslide-vertical",
            "slotfade-vertical",
            "curtain-1",
            "curtain-2",
            "curtain-3",
            "slideleft",
            "slideright",
            "slideup",
            "slidedown",
            "fade"
        ];

        // Easing
        $scope.dataEasing = [
            "easeOutBack",
            "easeInQuad",
            "easeOutQuad",
            "easeInOutQuad",
            "easeInCubic",
            "easeOutCubic",
            "easeInOutCubic",
            "easeInQuart",
            "easeOutQuart",
            "easeInOutQuart",
            "easeInQuint",
            "easeOutQuint",
            "easeInOutQuint",
            "easeInSine",
            "easeOutSine",
            "easeInOutSine",
            "easeInExpo",
            "easeOutExpo",
            "easeInOutExpo",
            "easeInCirc",
            "easeOutCirc",
            "easeInOutCirc",
            "easeInElastic",
            "easeOutElastic",
            "easeInOutElastic",
            "easeInBack",
            "easeOutBack",
            "easeInOutBack",
            "easeInBounce",
            "easeOutBounce",
            "easeInOutBounce"
        ];

        // Animation
        $scope.animationClasses = [
            { value: "sft", alias: "ShortfromTop" },
            { value: "sfb", alias: "ShortfromBottom" },
            { value: "sfr", alias: "ShortfromRight" },
            { value: "sfl", alias: "ShortfromLeft" },
            { value: "lft", alias: "LongfromTop" },
            { value: "lfb", alias: "LongfromBottom" },
            { value: "lfr", alias: "LongfromRight" },
            { value: "lfl", alias: "LongfromLeft" },
            { value: "fade", alias: "fading" }
        ];

        // Slide slot amount
        $scope.dataSlotamount = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        //$scope.selectedSlideIndex = -1;
        //$scope.selectedLayerIndex = -1;
        $scope.currentSlide;

        if (!$scope.model.config.mediaStartNode)
            $scope.model.config.mediaStartNode = -1;

        /********************************************************************************************/
        /* Slide managment */
        /********************************************************************************************/

        /* add a new slide */
        $scope.addSlide = function () {
            $scope.model.value.slides.splice($scope.model.value.slides.length + 1, 0,
            {
                dataTransition: "random",
                dataSlotamount: "0",
                dataDelay: "",
                dataMasterspeed: "",
                mediaId: -1,
                mediaSrc: '',
                mediaThumbnail: '',
                backgroundColor: '',
                //previousParentWidth: $scope.fluidWidth,
                //previousParentHeight: $scope.fluidHeight,
                layers: []
            });
        }

        /* duplicate slide */
        $scope.duplicateSlide = function (slide, $index) {
            $scope.model.value.slides.splice($index + 1, 0,
                angular.copy(slide)
            );
        }

        /* edit the current slide */
        $scope.editSlide = function (slide) {
            $scope.currentSlide = slide;

            if ($scope.currentSlide.layers && $scope.currentSlide.layers.length > 0) {
                $scope.currentLayer = $scope.currentSlide.layers[0];
            }
            else {
                $scope.currentLayer = undefined;
            }

        }

        /* remove slide */
        $scope.removeSlide = function ($index) {
            $scope.model.value.slides.splice($index, 1);
            $scope.closeEditSlide();
        }

        /* close slide editing */
        $scope.closeEditSlide = function () {
            $scope.currentSlide = undefined;
        }

        /* remove media slide background */
        $scope.removeMedia = function (slide) {
            slide.backgroundColor = '';
            slide.mediaThumbnail = '';
            slide.mediaId = -1;
            slide.mediaSrc = ''
        }

        /* add slide media background*/
        $scope.addMedia = function (slide) {
            dialogService.mediaPicker({
                multiPicker: false,
                startNodeId : $scope.model.config.mediaStartNode,
                callback: function (data) {

                    //it's only a single selector, so make it into an array
                    if (!false) {
                        data = [data];
                    }

                    _.each(data, function (media, i) {
                        media.thumbnail = imageHelper.getThumbnailFromPath(media.image);
                        slide.mediaId = media.id;
                        slide.mediaSrc = media.image;
                        slide.mediaThumbnail = media.thumbnail;
                    });

                }
            });
        };

        /********************************************************************************************/
        /* Layer managment */
        /********************************************************************************************/

        $scope.currentLayer;
        $scope.overLayer;

        $scope.setOverLayer = function (layer) {
            $scope.overLayer = layer;
        }

        $scope.initOverLayer = function (layer) {
            $scope.overLayer = undefined;
        }

        $scope.editLayer = function (layer) {
            $scope.currentLayer = layer;
        }

        $scope.removeLayer = function (index) {
            $scope.currentSlide.layers.splice(index, 1);
        }

        $scope.addTextLayer = function () {
            if ($scope.currentSlide.layers == undefined) { $scope.currentSlide.layers = []; }
            $scope.currentSlide.layers.splice($scope.currentSlide.layers.length + 1, 0, {
                name: "Text " + ($scope.currentSlide.layers.length + 1),
                content: "Lorem lipsum",
                type: "text",
                animationClass: "sft",
                dataX: "0",
                dataY: "0",
                dataSpeed: "1000",
                dataStart: "800",
                dataEasing: "",
                width: "",
                height: "",
                color: "#333",
                fontSize: 26,
                fontStyle: "",
                backgroundColor: "",
                padding: 10,
                customCss: "",
                //dataEndspeed: "0",
                //dataEndeasing: "0",
                //dataEndspeed: "0",
                //dataCaptionhidden: "0"
            });
            $scope.currentLayer = $scope.currentSlide.layers[$scope.currentSlide.layers.length -1];
        }

        $scope.addPictureLayer = function () {
            dialogService.mediaPicker({
                multiPicker: false,
                callback: function (data) {

                    //it's only a single selector, so make it into an array
                    if (!false) {
                        data = [data];
                    }

                    _.each(data, function (media, i) {

                        media.thumbnail = imageHelper.getThumbnailFromPath(media.image);
                        if ($scope.currentSlide.layers == undefined) { $scope.currentSlide.layers = []; }
                        $scope.currentSlide.layers.splice($scope.currentSlide.layers.length + 1, 0, {
                            name: "Image " + ($scope.currentSlide.layers.length + 1),
                            content: media.image,
                            type: "image",
                            animationClass: { value: "sft", alias: "ShortfromTop" },
                            dataX: "0",
                            dataY: "0",
                            dataSpeed: "1000",
                            dataStart: "800",
                            dataEasing: "",
                            width: 200,
                            height: "",
                            color: "",
                            fontSize: "",
                            fontStyle: "",
                            padding: "",
                            customCss: ""
                            //dataEndspeed: "0",
                            //dataEndeasing: "0",
                            //dataEndspeed: "0",
                            //dataCaptionhidden: "0"
                        });
                        $scope.currentLayer = $scope.currentSlide.layers[$scope.currentSlide.layers.length -1];
                    });

                }
            });
        }

        $scope.addMovieLayer = function () {

            dialogService.embedDialog({
                callback: function (data) {
                    if ($scope.currentSlide.layers == undefined) { $scope.currentSlide.layers = []; }
                    $scope.currentSlide.layers.splice($scope.currentSlide.layers.length + 1, 0, {
                        name: "Embed " + ($scope.currentSlide.layers.length + 1),
                        content: data,
                        type: "embed",
                    });
                    $scope.currentLayer = $scope.currentSlide.layers[$scope.currentSlide.layers.length - 1];
                }
            });

        };

        $scope.setSliderStyle = function () {
            if ($scope.model.value && $scope.currentSlide) {
                return {
                    'background-color': $scope.currentSlide.backgroundColor,
                    'background-image': 'url(' + $scope.currentSlide.mediaSrc + ')',
                    'height': $scope.model.value.editorHeight + 'px',
                    'background-size':  $scope.model.config.imageFullWidth == 0 ? 'cover' : '100%',
                    'background-position': 'top center'
                }
            }
        };

        $scope.setSliderHeight = function () {
            if ($scope.model.value && $scope.currentSlide) {
                return {
                    'width': $scope.model.value.editorWidth + 'px'
                }
            }
        };

        $scope.setLayerStyle = function (layer) {
            if (layer) {
                return {
                    'top': layer.dataY,
                    'left': layer.dataX,
                    'width': layer.width + 'px',
                    'height': layer.height + 'px'
                }
            }
        };

        $scope.setLayerStyleInto = function (layer) {
            if (layer) {
                return {
                    'background-color': layer.backgroundColor,
                    'font-size': layer.fontSize + 'px',
                    'line-height': layer.fontSize + 'px',
                    'color': layer.color,
                    'padding': layer.padding + 'px'
                }
            }
        };

        /********************************************************************************************/
        /* General */
        /********************************************************************************************/

        $scope.sortableOptions = {
            handle: ".icon-navigation",
            delay: 150,
            distance: 5,
            update: function (e, ui) {
            },
            stop: function (e, ui) {
            }
        };

        var width = $scope.model.config.width ? $scope.model.config.width : 1140;
        var height = $scope.model.config.height ? $scope.model.config.height : 550;
        var editorWidth = $scope.model.config.editorWidth ? $scope.model.config.editorWidth : 1140;
        var editorHeight = $scope.model.config.editorHeight ? $scope.model.config.editorHeight : 550;

        if (!$scope.model.value ||
            $scope.model.value == '') {
            $scope.model.value = {
                width: width,
                height: height,
                editorWidth: editorWidth,
                editorHeight: editorHeight,
                slides: []
            }
        }
        else {
            $scope.model.value.width = width,
            $scope.model.value.height = height,
            $scope.model.value.editorWidth = editorWidth,
            $scope.model.value.editorHeight = editorHeight
        }

        var unsubscribe = $scope.$on("formSubmitting", function () {
            $scope.closeEditSlide();
        });

        assetsService.loadCss("/App_Plugins/Lecoati.uSky.Slider/lib/jquery-ui-1.10.4.custom/css/ui-lightness/jquery-ui-1.10.4.custom.min.css");
        assetsService.loadCss("/App_Plugins/Lecoati.uSky.Slider/lib/colorpicker.css");
        assetsService.loadCss("/App_Plugins/Lecoati.uSky.Slider/lib/uSky.Slider.css");

    });