'use strict';

angular.module('graphApp')
    .directive('workflowGraph', [function () {
        return {
            restrict: 'E',

            link: function (scope, element, attrs) {

                var width = 1000,
                    height = 600,
                    stepFocus = {x: width / 4, y: height / 4},
                    defFocus = {x: 3 * width / 4, y: 3 * height / 4};

                var forceLayout = d3.layout.force()
                    .friction(.7)
                    .charge(-1000)
                    .linkDistance(200)
                    .size([width, height])
                    .on('tick', tick);

                var svgGraph = d3.select(element[0]).append("svg")
                    .attr("width", width)
                    .attr("height", height);

                var selectAllNodes = svgGraph.selectAll(".node"),
                    selectAllLinks = svgGraph.selectAll(".link"),
                    selectAllNodeTexts = svgGraph.selectAll(".nodeLabel"),
                    selectAllLinkTexts = svgGraph.selectAll(".linkLabel");

                /**
                 *  function syncs the layout's nodes with the scope nodes and restarts the graph simulation
                 */
                scope.restartGraph = function (n, l) {

                    if (n) {
                        forceLayout.nodes(n);
                    } else {
                        forceLayout.nodes(scope.graphData.nodes);
                    }

                    if (l) {
                        forceLayout.links(l);
                    } else {
                        forceLayout.links(scope.graphData.links);
                    }

                    //console.log('restarting... nodes ' + JSON.stringify(forceLayout.nodes()) + ' links ' + JSON.stringify(forceLayout.links()))

                    selectAllNodes = selectAllNodes.data(forceLayout.nodes(), function (d) {
                        return d.name + '' + d.content;
                    });
                    selectAllNodeTexts = selectAllNodeTexts.data(forceLayout.nodes(), function (d) {
                        return d.name + '' + d.content;
                    });
                    selectAllLinks = selectAllLinks.data(forceLayout.links(), function (d) {
                        return d.source + '' + d.target + '' + d.condition;
                    });
                    selectAllLinkTexts = selectAllLinkTexts.data(forceLayout.links(), function (d) {
                        return d.source + '' + d.target + '' + d.condition;
                    });

                    selectAllLinks.enter().insert("line", ".node")
                        .attr("class", "link");

                    selectAllLinkTexts.enter().append('text')
                        .attr('class', 'linkLabel')
                        .attr('dx', 5)
                        .attr('dy', '.1em')
                        .text(function (d) {
                            return d.condition || '';
                        });

                    selectAllNodes.enter().insert("circle")
                        .attr("class", function (d) {
                            if (d.initial === true) {
                                return 'node step initial';
                            } else if (d.type === 'def') {
                                return 'node def';
                            } else if (d.type === 'step') {
                                return 'node step';
                            }
                        })
                        .attr("r", 10)
                        .call(forceLayout.drag);

                    selectAllNodeTexts.enter().append('text')
                        .attr('class', 'nodeLabel')
                        .attr('dx', 12)
                        .attr('dy', '.35em')
                        .text(function (d) {
                            return d.name || 'no name';
                        });

                    selectAllLinkTexts.exit().remove();
                    selectAllLinks.exit().remove();
                    selectAllNodeTexts.exit().remove();
                    selectAllNodes.exit().remove();

                    selectAllNodes.on('click', toggleNodeDialogAndApply);

                    selectAllNodes.on("mouseover", nodeMouseover);
                    selectAllNodes.on("mouseout", nodeMouseout);

                    forceLayout.start();
                };

                // call restart once during initialization
                scope.restartGraph();

                function tick(e) {

                    var k = .1 * e.alpha;
                    forceLayout.nodes().forEach(function (o, i) {
                        var type = o.type || 'none set';

                        if (type === 'step') {

                            o.y += (stepFocus.y - o.y) * k;
                            o.x += (stepFocus.x - o.x) * k;

                        } else if (type === 'def') {

                            o.y += (defFocus.y - o.y) * k;
                            o.x += (defFocus.x - o.x) * k;

                        } else {
                        }
                    });

                    selectAllLinks
                        .attr("x1", function (d) {
                            return d.source.x;
                        })
                        .attr("y1", function (d) {
                            return d.source.y;
                        })
                        .attr("x2", function (d) {
                            return d.target.x;
                        })
                        .attr("y2", function (d) {
                            return d.target.y;
                        });

                    selectAllLinkTexts
                        .attr("transform", function (d) {
                            var x1 = d.source.x,
                                y1 = d.source.y,
                                x2 = d.target.x,
                                y2 = d.target.y;

                            return "translate(" + (x1 + x2) / 2 + "," + (y1 + y2) / 2 + ")";
                        });

                    selectAllNodes
                        .attr("cx", function (d) {
                            return d.x;
                        })
                        .attr("cy", function (d) {
                            return d.y;
                        });

                    selectAllNodeTexts.attr("transform", function (d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });

                }

                scope.resetGraph = function () {
                    scope.restartGraph([], []);
                }

                function toggleNodeDialogAndApply(element) {

                    if (d3.event.defaultPrevented) {
                        return;
                    } else {

                        scope.$apply(function () {
                            scope.showNodeDialog(element);
                        });

                    }
                }

                function nodeMouseover(element) {

                    element.origSize = d3.select(this).attr('r');

                    var newSize = element.origSize * 1.5;

                    d3.select(this).attr('r', newSize);
                }

                function nodeMouseout(element) {

                    d3.select(this)
                        .attr('r', element.origSize)
                        .select('text.hoverText').remove();

                }


            } // end link
        }; // end return
    }]); // end directive
