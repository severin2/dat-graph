'use strict';

angular.module('graphApp')
    .controller('graphController', function ($scope, fileReader, xmlWorkflowParser) {


        $scope.showDialog = false;
        $scope.selectedNodeData = { };
        $scope.selectedNodeKeys = [];

        $scope.workflowText = "when you upload a workflow, the file contents will display here";

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
                {source: 0, target: 1, condition: 'Ω'},
                {source: 1, target: 2, condition: 'ß'},
                {source: 2, target: 3, condition: 'π'}
            ]
        };

        $scope.screen = 1;

        $scope.showNodeDialog = function (element) {

            $scope.selectedNodeData = element;
            $scope.selectedNodeKeys = [];

            for(var key in element) {
                $scope.selectedNodeKeys.push(key);
            }
            $scope.showDialog = true;
        };

        $scope.hideNodeDialog = function () {
            $scope.showDialog = false;
        }

        $scope.getFile = function (file) {
            $scope.progress = 0;
            fileReader.readFileAsText(file, $scope)
                .then(function (result) {

                    $scope.workflowText = result;
                    //console.log('read file ' + file.name);

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




