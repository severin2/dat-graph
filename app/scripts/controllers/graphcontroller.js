'use strict';

angular.module('graphApp')
    .controller('graphController', function ($scope, fileReader, xmlWorkflowParser) {

        $scope.dialogModel = {
            text : 'not set',
            show : false,
            type : 'step'
        }

        $scope.graphData = {
            nodes: [
                {name: 1},
                {name: 2},
                {name: 3},
                {name: 4},
                {name: 5},
                {name: 6}
            ],
            links: [
                {source: 0, target: 1},
                {source: 1, target: 2},
                {source: 2, target: 3}
            ]
        };

        $scope.screen = 1;

        $scope.workflowText = JSON.stringify($scope.graphData);

        $scope.showNodeDialog = function (element) {
            $scope.dialogModel.type = element.type;
            $scope.dialogModel.text = element && element.content ? element.content : 'no content';
            $scope.dialogModel.show = true;
            };

        $scope.hideNodeDialog = function () {
            $scope.dialogModel.show = false;
        }

        $scope.getFile = function (file) {
            $scope.progress = 0;
            fileReader.readFileAsText(file, $scope)
                .then(function (result) {
                    //console.log('read file ' + file.name);
                    $scope.workflowText = result;

                    var fileExt = getExtensionFromFileName(file.name);

                    if (fileExt && fileExt === 'json') {
                        // TODO verify by trying to parse to json

                        //console.log('consuming as JSON')
                        parseFileResultAsJson(result);
                        $scope.restartGraph();

                    } else if (fileExt && fileExt === 'xml') {
                        // TODO verify using xsd?

                        //console.log('consuming as XML')
                        xmlWorkflowParser.parseUsingXML(result, $scope)
                            .then(function (res) {
                                //console.log(res);
                            });
                        $scope.restartGraph();
                    } else {
                        // not a good file type
                    }
                });
        };

        $scope.$on("fileProgress", function (e, progress) {
            $scope.progress = progress.loaded / progress.total;
        });

        function parseFileResultAsJson(result) {

            var res = JSON.parse(result);

            $scope.graphData.nodes = res.nodes;
            $scope.graphData.links = res.links;

        }

        function getExtensionFromFileName(f) {

            var array = f.split('.');

            return array[array.length - 1];

        }
    });




