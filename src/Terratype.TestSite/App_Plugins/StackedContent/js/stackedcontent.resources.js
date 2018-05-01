angular.module('umbraco.resources').factory('Our.Umbraco.StackedContent.Resources.StackedContentResources',
    function ($q, $http, umbRequestHelper) {
        return {
            getPreviewMarkup: function (data, parentId) {
                return umbRequestHelper.resourcePromise(
                    $http({
                        url: "/umbraco/backoffice/StackedContent/StackedContentApi/GetPreviewMarkup",
                        method: "POST",
                        params: { parentId: parentId },
                        data: data
                    }),
                    'Failed to retrieve preview markup'
                );
            }
        };
    });