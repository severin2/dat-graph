'use strict';

angular.module('graphApp')
    .directive("myFileSelect", [function () {
        return {
            link: function ($scope, element, attributes) {
                element.bind("change", function (evt) {
                    var file = (evt.srcElement || evt.target).files[0];
                    $scope.getFile(file);
                });
            }
        }
    }]);
