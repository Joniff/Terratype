angular.module('umbraco.resources').factory('Our.Umbraco.InnerContent.Resources.InnerContentResources',
    function ($q, $http, umbRequestHelper) {
        return {
            getContentTypes: function () {
                return umbRequestHelper.resourcePromise(
                    $http({
                        url: "/umbraco/backoffice/InnerContent/InnerContentApi/GetContentTypes",
                        method: "GET"
                    }),
                    'Failed to retrieve content types'
                );
            },
            getContentTypeInfos: function (aliases) {
                return umbRequestHelper.resourcePromise(
                    $http({
                        url: "/umbraco/backoffice/InnerContent/InnerContentApi/GetContentTypeInfos",
                        method: "GET",
                        params: { aliases: aliases }
                    }),
                    'Failed to retrieve content types'
                );
            },
            getContentTypeIcons: function (aliases) {
                return umbRequestHelper.resourcePromise(
                    $http({
                        url: "/umbraco/backoffice/InnerContent/InnerContentApi/GetContentTypeIcons",
                        method: "GET",
                        params: { aliases: aliases }
                    }),
                    'Failed to retrieve content type icons'
                );
            }
        };
    });