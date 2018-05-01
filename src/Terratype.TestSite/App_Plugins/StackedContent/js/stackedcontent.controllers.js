angular.module("umbraco").controller("Our.Umbraco.StackedContent.Controllers.StackedContentPropertyEditorController", [

    "$scope",
    "editorState",
    "innerContentService",
    "Our.Umbraco.StackedContent.Resources.StackedContentResources",

    function ($scope, editorState, innerContentService, scResources) {

        $scope.inited = false;
        $scope.markup = {};
        $scope.prompts = {};
        $scope.model.value = $scope.model.value || [];

        $scope.canAdd = function () {
            return (!$scope.model.config.maxItems || $scope.model.config.maxItems == 0 || $scope.model.value.length < $scope.model.config.maxItems) && $scope.model.config.singleItemMode != "1";
        }

        $scope.canDelete = function () {
            return $scope.model.config.singleItemMode !== "1";
        }

        $scope.addContent = function (evt, idx) {
            $scope.overlayConfig.event = evt;
            $scope.overlayConfig.data = { model: null, idx: idx, action: "add" };
            $scope.overlayConfig.show = true;
        }

        $scope.editContent = function (evt, idx, itm) {
            $scope.overlayConfig.event = evt;
            $scope.overlayConfig.data = { model: itm, idx: idx, action: "edit" };
            $scope.overlayConfig.show = true;
        }

        $scope.deleteContent = function (evt, idx) {
            $scope.model.value.splice(idx, 1);
        }

        $scope.sortableOptions = {
            axis: 'y',
            cursor: "move",
            handle: ".stack__preview-wrapper",
            helper: function () {
                return $('<div class=\"stack__sortable-helper\"><div><i class=\"icon icon-navigation\"></i></div></div>');
            },
            cursorAt: {
                top: 0
            },
            update: function (e, ui) {
                _.each($scope.model.value, function (itm, idx) {
                    innerContentService.populateName(itm, idx, $scope.model.config.contentTypes);
                });
            }
        };

        // Helpers
        var loadPreviews = function () {
            _.each($scope.model.value, function (itm) {
                scResources.getPreviewMarkup(itm, editorState.current.id).then(function (markup) {
                    if (markup) {
                        $scope.markup[itm.key] = markup;
                    }
                });
            });
        }

        var previewEnabled = function () {
            return $scope.model.config.disablePreview !== "1";
        }


        // Set overlay config
        $scope.overlayConfig = {
            propertyAlias: $scope.model.alias,
            contentTypes: $scope.model.config.contentTypes,
            show: false,
            data: {
                idx: 0,
                model: null
            },
            callback: function (data) {
                innerContentService.populateName(data.model, data.idx, $scope.model.config.contentTypes);

                if (previewEnabled()) {
                    scResources.getPreviewMarkup(data.model, editorState.current.id).then(function (markup) {
                        if (markup) {
                            $scope.markup[data.model.key] = markup;
                        }
                    });
                }

                if (!($scope.model.value instanceof Array)) {
                    $scope.model.value = [];
                }

                if (data.action === "add") {
                    $scope.model.value.splice(data.idx, 0, data.model);
                } else if (data.action === "edit") {
                    $scope.model.value[data.idx] = data.model;
                }
            }
        }

        // Initialize value
        if ($scope.model.value.length > 0) {

            // Model is ready so set inited
            $scope.inited = true;

            // Sync icons incase it's changes on the doctype
            var aliases = _.uniq($scope.model.value.map(function (itm) {
                return itm.icContentTypeAlias;
            }));

            innerContentService.getContentTypeIcons(aliases).then(function (data) {
                _.each($scope.model.value, function (itm) {
                    if (data.hasOwnProperty(itm.icContentTypeAlias)) {
                        itm.icon = data[itm.icContentTypeAlias];
                    }
                });

                // Try loading previews
                if (previewEnabled()) {
                    loadPreviews();
                }
            });

        } else if ($scope.model.config.singleItemMode === "1") {

            // Initialise single item mode model
            innerContentService.createDefaultDbModel($scope.model.config.contentTypes[0]).then(function (v) {

                $scope.model.value = [v];

                // Model is ready so set inited
                $scope.inited = true;

                // Try loading previews
                if (previewEnabled()) {
                    loadPreviews();
                }

            });

        } else {

            // Model is ready so set inited
            $scope.inited = true;

        }
    }

]);