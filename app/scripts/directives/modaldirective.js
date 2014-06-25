'use strict';

angular.module('graphApp')
  .directive('modalDialog', function () {
        return {
            restrict: 'E',
            replace: true, // replace element with the template
            transclude: true, // replace the ng-transclude in the template with the text from the element
            link: function (scope, element, attrs) {
                scope.modalStyle = {};
                if (attrs.width)
                    scope.modalStyle.width = attrs.width;
                if (attrs.height)
                    scope.modalStyle.height = attrs.height;
                scope.hideModal = function () {
                    scope.showDialog = false;
                };
            },
            template: "<div class='ng-modal'> " +
                "<div class='ng-modal-overlay' ng-click='hideModal()'></div>" +
                "<div class='ng-modal-dialog' ng-style='modalStyle'>" +
                "<div class='ng-modal-close' ng-click='hideModal()'>X</div>" +
                "<div class='ng-modal-dialog-content' ng-transclude></div>" +
                "</div>" +
                "</div>"
        };
    });
