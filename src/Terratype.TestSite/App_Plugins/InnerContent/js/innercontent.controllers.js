// Prevalue Editors
angular.module("umbraco").controller("Our.Umbraco.InnerContent.Controllers.DocTypeTabPickerController", [

    "$scope",
    "innerContentService",

    function ($scope, innerContentService) {

        $scope.add = function () {
            $scope.model.value.push({
                // All stored content type aliases must be prefixed "mb" for easier recognition.
                // For good measure we'll also prefix the tab alias "mb" 
                icContentTypeAlias: "",
                icTabAlias: "",
                nameTemplate: ""
            });
        }

        $scope.selectedDocTypeTabs = function (cfg) {
            var dt = _.find($scope.model.docTypes, function (itm) {
                return itm.alias.toLowerCase() === cfg.icContentTypeAlias.toLowerCase();
            });
            var tabs = dt ? dt.tabs : [];
            if (!_.contains(tabs, cfg.icTabAlias)) {
                cfg.icTabAlias = tabs[0];
            }
            return tabs;
        }

        $scope.remove = function (index) {
            $scope.model.value.splice(index, 1);
        }

        $scope.sortableOptions = {
            axis: 'y',
            cursor: "move",
            handle: ".icon-navigation"
        };

        innerContentService.getContentTypes().then(function (docTypes) {
            $scope.model.docTypes = docTypes;
        });

        if (!$scope.model.value) {
            $scope.model.value = [];
            $scope.add();
        }
    }
]);

angular.module("umbraco").controller("Our.Umbraco.InnerContent.Controllers.DocTypePickerController", [

    "$scope",
    "Our.Umbraco.InnerContent.Resources.InnerContentResources",

    function ($scope, icResources) {

        $scope.add = function () {
            $scope.model.value.push({
                // All stored content type aliases must be prefixed "mb" for easier recognition.
                // For good measure we'll also prefix the tab alias "mb" 
                icContentTypeAlias: "",
                nameTemplate: ""
            });
        }

        $scope.remove = function (index) {
            $scope.model.value.splice(index, 1);
        }

        $scope.sortableOptions = {
            axis: 'y',
            cursor: "move",
            handle: ".icon-navigation"
        };

        icResources.getContentTypes().then(function (docTypes) {
            $scope.model.docTypes = docTypes;
        });

        if (!$scope.model.value) {
            $scope.model.value = [];
            $scope.add();
        }
    }
]);

// Property Editors
angular.module("umbraco").controller("Our.Umbraco.InnerContent.Controllers.InnerContentDialogController",
    [
        "$scope",
        "$interpolate",
        "formHelper",
        "contentResource",

        function ($scope) {
            $scope.item = $scope.model.dialogData.item;
        }

    ]);

// Directives
angular.module('umbraco.directives').directive('innerContentOverlay', [
    
    "$q",
    "innerContentService",

    function ($q, innerContentService) {

        function link(scope, el, attr, ctrl) {

            scope.config.editorModels = scope.config.editorModels || {};
            scope.currentItem = null;

            var getContentType = function (alias) {
                return _.find(scope.config.contentTypes, function (ct) {
                    return ct.icContentTypeAlias === alias;
                });
            }

            // Helper function to createEditorModel but at the same time
            // cache the scaffold so that if we create another item of the same
            // content type, we don't need to fetch the scaffold again
            var createEditorModel = function (contentType, dbModel) {

                var process = function(editorModel, dbModel2) {
                    var n = angular.copy(editorModel);
                    n.key = innerContentService.generateUid(); // Create new ID for item
                    return innerContentService.extendEditorModel(n, dbModel2);
                }

                if (scope.config.editorModels.hasOwnProperty(contentType.icContentTypeAlias)) {
                    var res = process(scope.config.editorModels[contentType.icContentTypeAlias], dbModel);
                    return $q.when(res);
                } else {
                    return innerContentService.createEditorModel(contentType).then(function (em) {
                        scope.config.editorModels[contentType.icContentTypeAlias] = em;
                        var res = process(scope.config.editorModels[contentType.icContentTypeAlias], dbModel);
                        return res;
                    });
                }
            }

            scope.contentTypePickerOverlay = {
                view: "itempicker",
                filter: false,
                title: "Insert Content",
                show: false,
                submit: function (model) {
                    var ct = getContentType(model.selectedItem.alias);
                    createEditorModel(ct).then(function (em) {
                        scope.currentItem = em;
                        scope.closeContentTypePickerOverlay();
                        scope.openContentEditorOverlay();
                    });
                },
                close: function() {
                    scope.closeAllOverlays();
                }
            };

            scope.contentEditorOverlay = {
                view: Umbraco.Sys.ServerVariables.umbracoSettings.appPluginsPath + "/innercontent/views/innercontent.dialog.html",
                show: false,
                submit: function(model) {
                    if (scope.config.callback) {
                        // Convert model to basic model
                        scope.config.data.model = innerContentService.createDbModel(model.dialogData.item);

                        // Notify callback
                        scope.config.callback(scope.config.data);
                    }
                    scope.closeAllOverlays();
                },
                close: function() {
                    scope.closeAllOverlays();
                }
            };

            scope.openContentTypePickerOverlay = function() {

                if (scope.contentTypePickerOverlay.availableItems.length === 0) {
                    scope.closeAllOverlays();
                    return;
                }

                if (scope.contentTypePickerOverlay.availableItems.length === 1) {
                    var ct = getContentType(scope.contentTypePickerOverlay.availableItems[0].alias);
                    createEditorModel(ct).then(function (em) {
                        scope.currentItem = em;
                        scope.openContentEditorOverlay();
                    });
                } else {
                    scope.contentTypePickerOverlay.event = scope.config.event;
                    scope.contentTypePickerOverlay.show = true;
                }

            };

            scope.closeContentTypePickerOverlay = function() {
                scope.contentTypePickerOverlay.show = false;
            };

            scope.openContentEditorOverlay = function() {
                scope.contentEditorOverlay.title = "Edit item",
                    scope.contentEditorOverlay.dialogData = { item: scope.currentItem };
                scope.contentEditorOverlay.show = true;
            };

            scope.closeContentEditorOverlay = function() {
                scope.contentEditorOverlay.show = false;
            };

            scope.closeAllOverlays = function() {
                scope.closeContentTypePickerOverlay();
                scope.closeContentEditorOverlay();
                scope.config.show = false;
            };

            var initOpen = function () {

                // Map scaffolds to content type picker list
                scope.contentTypePickerOverlay.availableItems = scope.config.contentTypePickerItems;

                // Open relevant dialog
                if (!scope.config.data || !scope.config.data.model) {
                    scope.openContentTypePickerOverlay();
                } else {
                    var ct = getContentType(scope.config.data.model.icContentTypeAlias);
                    createEditorModel(ct, scope.config.data.model).then(function (em) {
                        scope.currentItem = em;
                        scope.openContentEditorOverlay();
                    });
                }

            }

            // Initialize
            if (scope.config) {

                // If overlay items haven't be initialized, then intialize them
                if (!scope.config.contentTypePickerItems) {

                    var aliases = scope.config.contentTypes.map(function(itm) {
                        return itm.icContentTypeAlias;
                    });

                    innerContentService.getContentTypeInfos(aliases).then(function(docTypes) {

                        // Cache items in the PE's config so we only request these once per PE instance
                        scope.config.contentTypePickerItems = docTypes;

                        initOpen();

                    });

                } else {

                    initOpen();

                }

            }
        }

        var directive = {
            restrict: 'E',
            replace: true,
            templateUrl: Umbraco.Sys.ServerVariables.umbracoSettings.appPluginsPath + '/innercontent/views/innercontent.overlay.html',
            scope: {
                config: "="
            },
            link: link
        };

        return directive;

    }
]);

// Services
angular.module("umbraco").factory('innerContentService', [

    "$q",
    "$interpolate",
    "contentResource",

    "Our.Umbraco.InnerContent.Resources.InnerContentResources",

    function ($q, $interpolate, contentResource, icResources) {

        var self = {};

        var getScaffold = function (contentType) {
            return contentResource.getScaffold(-20, contentType.icContentTypeAlias).then(function(scaffold) {

                // remove all tabs except the specified tab
                if (contentType.hasOwnProperty("icTabAlias")) {

                    var tab = _.find(scaffold.tabs, function(tab) {
                        return tab.id !== 0 && (tab.alias.toLowerCase() === contentType.icTabAlias.toLowerCase() || contentType.icTabAlias === "");
                    });
                    scaffold.tabs = [];
                    if (tab) {
                        scaffold.tabs.push(tab);
                    }

                } else {

                    // Remove general properties tab
                    scaffold.tabs.pop();

                }

                return scaffold;

            });
        }

        self.populateName = function (itm, idx, contentTypes) {

            var contentType = _.find(contentTypes, function(itm2) {
                return itm2.icContentTypeAlias === itm.icContentTypeAlias;
            });

            var nameTemplate = contentType.nameTemplate || "Item {{$index+1}}";
            var nameExp = $interpolate(nameTemplate);

            if (nameExp) {
                    
                // Inject temporary index property
                itm.$index = idx;

                // Execute the name expression
                var newName = nameExp(itm);
                if (newName && (newName = $.trim(newName)) && itm.name !== newName) {
                    itm.name = newName;
                }

                // Remove temporary index property
                delete itm.$index;
            }

        }

        self.getContentTypes = function () {
            return icResources.getContentTypes();
        }

        self.getContentTypeInfos = function (aliases) {
            return icResources.getContentTypeInfos(aliases);
        }

        self.getContentTypeIcons = function (aliases) {
            return icResources.getContentTypeIcons(aliases);
        }

        self.createEditorModel = function (contentType, dbModel) {

            return getScaffold(contentType).then(function (scaffold) {

                scaffold.key = self.generateUid();
                scaffold.icContentTypeAlias = scaffold.contentTypeAlias;
                scaffold.name = "Untitled";

                return self.extendEditorModel(scaffold, dbModel);

            });
            
        }

        self.extendEditorModel = function(editorModel, dbModel) {

            editorModel.key = dbModel && dbModel.key ? dbModel.key : editorModel.key;
            editorModel.name = dbModel && dbModel.name ? dbModel.name : editorModel.name;

            if (!editorModel.key) {
                editorModel.key = self.generateUid();
            }

            if (dbModel) {
                for (var t = 0; t < editorModel.tabs.length; t++) {
                    var tab = editorModel.tabs[t];
                    for (var p = 0; p < tab.properties.length; p++) {
                        var prop = tab.properties[p];
                        if (dbModel.hasOwnProperty(prop.alias)) {
                            prop.value = dbModel[prop.alias];
                        }
                    }
                }
            }

            return editorModel;

        }

        self.createDbModel = function (model) {

            var dbModel = {
                key: model.key,
                name: model.name,
                icon: model.icon,
                icContentTypeAlias: model.contentTypeAlias
            };

            for (var t = 0; t < model.tabs.length; t++) {
                var tab = model.tabs[t];
                for (var p = 0; p < tab.properties.length; p++) {
                    var prop = tab.properties[p];
                    if (typeof prop.value !== "function") {
                        dbModel[prop.alias] = prop.value;
                    }
                }
            }

            return dbModel;
        }

        self.createDefaultDbModel = function (contentType) {
            return self.createEditorModel(contentType).then(function (editorModel) {
                return self.createDbModel(editorModel);
            });
        }

        // Helpful methods
        var lut = []; for (var i = 0; i < 256; i++) { lut[i] = (i < 16 ? '0' : '') + (i).toString(16); }
        self.generateUid = function () {
            var d0 = Math.random() * 0xffffffff | 0;
            var d1 = Math.random() * 0xffffffff | 0;
            var d2 = Math.random() * 0xffffffff | 0;
            var d3 = Math.random() * 0xffffffff | 0;
            return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
              lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
              lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
              lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
        }

        return self;
    }

]);