'use strict';
angular.module('graphApp', []);
'use strict';
angular.module('graphApp').controller('graphController', [
  '$scope',
  'fileReader',
  'xmlWorkflowParser',
  function ($scope, fileReader, xmlWorkflowParser) {
    $scope.dialogText = 'not set';
    $scope.graphData = {
      nodes: [
        { name: 1 },
        { name: 2 },
        { name: 3 },
        { name: 4 },
        { name: 5 },
        { name: 6 }
      ],
      links: [
        {
          source: 0,
          target: 1
        },
        {
          source: 1,
          target: 2
        },
        {
          source: 2,
          target: 3
        }
      ]
    };
    $scope.showDialog = false;
    $scope.screen = 1;
    $scope.workflowText = JSON.stringify($scope.graphData);
    $scope.showNodeDialog = function (element) {
      if (element && element.content) {
        $scope.dialogText = element.content;
      } else {
        $scope.dialogText = 'no content';
      }
      $scope.showDialog = true;
    };
    $scope.hideNodeDialog = function () {
      $scope.showDialog = false;
    };
    $scope.getFile = function (file) {
      $scope.progress = 0;
      fileReader.readFileAsText(file, $scope).then(function (result) {
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
          xmlWorkflowParser.parseUsingXML(result, $scope).then(function (res) {
            console.log(res);
          });
          $scope.restartGraph();
        } else {
        }
      });
    };
    $scope.$on('fileProgress', function (e, progress) {
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
  }
]);
'use strict';
angular.module('graphApp').directive('workflowGraph', [function () {
    return {
      restrict: 'E',
      link: function (scope, element, attrs) {
        // inital value, is overridden by the css
        var width = 1000, height = 480, stepFocus = {
            x: width / 4,
            y: height / 4
          }, defFocus = {
            x: 3 * width / 4,
            y: 3 * height / 4
          };
        var forceLayout = d3.layout.force().friction(0.7).charge(-1000).linkDistance(200).size([
            width,
            height
          ]).on('tick', tick);
        var svgGraph = d3.select(element[0]).append('svg').attr('width', width).attr('height', height);
        var selectAllNodes = svgGraph.selectAll('.node'), selectAllLinks = svgGraph.selectAll('.link'), selectAllNodeTexts = svgGraph.selectAll('.nodeLabel'), selectAllLinkTexts = svgGraph.selectAll('.linkLabel');
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
          selectAllLinks.enter().insert('line', '.node').attr('class', 'link');
          selectAllLinkTexts.enter().append('text').attr('class', 'linkLabel').attr('dx', 5).attr('dy', '.1em').text(function (d) {
            return d.condition || '';
          });
          selectAllNodes.enter().insert('circle').attr('class', function (d) {
            if (d.initial === true) {
              return 'node step initial';
            } else if (d.type === 'def') {
              return 'node def';
            } else if (d.type === 'step') {
              return 'node step';
            }
          }).attr('r', 10).call(forceLayout.drag);
          selectAllNodeTexts.enter().append('text').attr('class', 'nodeLabel').attr('dx', 12).attr('dy', '.35em').text(function (d) {
            return d.name || 'no name';
          });
          selectAllLinkTexts.exit().remove();
          selectAllLinks.exit().remove();
          selectAllNodeTexts.exit().remove();
          selectAllNodes.exit().remove();
          selectAllNodes.on('click', toggleNodeDialogAndApply);
          selectAllNodes.on('mouseover', nodeMouseover);
          selectAllNodes.on('mouseout', nodeMouseout);
          forceLayout.start();
        };
        // call restart once during initialization
        scope.restartGraph();
        function tick(e) {
          var k = 0.1 * e.alpha;
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
          selectAllLinks.attr('x1', function (d) {
            return d.source.x;
          }).attr('y1', function (d) {
            return d.source.y;
          }).attr('x2', function (d) {
            return d.target.x;
          }).attr('y2', function (d) {
            return d.target.y;
          });
          selectAllLinkTexts.attr('transform', function (d) {
            var x1 = d.source.x, y1 = d.source.y, x2 = d.target.x, y2 = d.target.y;
            return 'translate(' + (x1 + x2) / 2 + ',' + (y1 + y2) / 2 + ')';
          });
          selectAllNodes.attr('cx', function (d) {
            return d.x;
          }).attr('cy', function (d) {
            return d.y;
          });
          selectAllNodeTexts.attr('transform', function (d) {
            return 'translate(' + d.x + ',' + d.y + ')';
          });
        }
        scope.resetGraph = function () {
          scope.restartGraph([], []);
        };
        function toggleNodeDialogAndApply(element) {
          //console.log('clicked: ' + JSON.stringify(element));
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
          d3.select(this).attr('r', element.origSize).select('text.hoverText').remove();
        }
      }  // end link
    };  // end return
  }]);
// end directive
'use strict';
angular.module('graphApp').directive('modalDialog', function () {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    link: function (scope, element, attrs) {
      scope.dialogStyle = {};
      if (attrs.width)
        scope.dialogStyle.width = attrs.width;
      if (attrs.height)
        scope.dialogStyle.height = attrs.height;
      scope.hideModal = function () {
        scope.showDialog = false;
      };
    },
    template: '<div class=\'ng-modal\'> ' + '<div class=\'ng-modal-overlay\' ng-click=\'hideModal()\'></div>' + '<div class=\'ng-modal-dialog\' ng-style=\'dialogStyle\'>' + '<div class=\'ng-modal-close\' ng-click=\'hideModal()\'>X</div>' + '<div class=\'ng-modal-dialog-content\' ng-transclude></div>' + '</div>' + '</div>'
  };
});
'use strict';
angular.module('graphApp').directive('myFileSelect', [function () {
    return {
      link: function ($scope, element, attributes) {
        element.bind('change', function (evt) {
          var file = (evt.srcElement || evt.target).files[0];
          $scope.getFile(file);
        });
      }
    };
  }]);
'use strict';
angular.module('graphApp').factory('fileReader', [
  '$q',
  function ($q) {
    var onLoad = function (reader, deferred, scope) {
      return function () {
        scope.$apply(function () {
          deferred.resolve(reader.result);
        });
      };
    };
    var onError = function (reader, deferred, scope) {
      return function () {
        scope.$apply(function () {
          deferred.reject(reader.result);
        });
      };
    };
    var onProgress = function (reader, scope) {
      return function (event) {
        scope.$broadcast('fileProgress', {
          total: event.total,
          loaded: event.loaded
        });
      };
    };
    var getReader = function (deferred, scope) {
      var reader = new FileReader();
      reader.onload = onLoad(reader, deferred, scope);
      reader.onerror = onError(reader, deferred, scope);
      reader.onprogress = onProgress(reader, scope);
      return reader;
    };
    var readFileAsURL = function (file, scope) {
      var deferred = $q.defer();
      var reader = getReader(deferred, scope);
      reader.readAsDataURL(file);
      return deferred.promise;
    };
    var readFileAsText = function (file, scope) {
      var deferred = $q.defer();
      var reader = getReader(deferred, scope);
      reader.readAsText(file);
      return deferred.promise;
    };
    return {
      readFileAsUrl: readFileAsURL,
      readFileAsText: readFileAsText
    };
  }
]);
'use strict';
angular.module('graphApp').factory('xmlWorkflowParser', [
  '$q',
  function ($q) {
    //        function parseUsingJSON(deferred, workflowText, scope) {
    //
    //            scope.graphData = {nodes: [], links: []};
    //
    //            var parser = new DOMParser(),
    //                xml = parser.parseFromString(workflowText, 'text/xml'),
    //                wf = xmlToJson(xml);
    //
    //            scope.workflowText = new XMLSerializer().serializeToString(xml);
    //
    //            console.log(JSON.stringify(wf));
    //            wf = wf.workflow;
    //
    //            for (var workflowPart in wf) {
    //                var stepType = workflowPart,
    //                    part = wf[workflowPart];
    //
    //                // if this part is a step with a transition
    //                if (partIsStepWithTransition(workflowPart, part)) {
    //
    //                    var transitions = part[0]['transition'];
    //                    var stepName = part[0]['@attributes']['name'];
    //
    //                    for (var i = 0; i < transitions.length; i++) {
    //                        var t = transitions[i];
    //
    //                        //console.log('transition: ' + JSON.stringify(t) + ' stepname: ' + stepName);
    //
    //                        var condition = t['@attributes']['condition'],
    //                            target = t['targetStepName']['#text'];
    //
    //                        //console.log('condition: ' + condition + ' target: ' + target);
    //
    //                        // TODO this assumes that there is only one of each step, there can be more
    //                        var content = (new XMLSerializer()).serializeToString(xml.getElementsByName(stepName)[0]);
    //                        var thisStepIndex = addOrGetNodeIndex(stepName, content, scope);
    //
    //                        content = (new XMLSerializer()).serializeToString(xml.getElementsByName(target)[0]);
    //                        var tarStepIndex = addOrGetNodeIndex(target, content, scope);
    //
    //                        addLink(thisStepIndex, tarStepIndex, scope);
    //
    //                        deferred.resolve('if ' + condition + ' then edge from ' + stepName + ' to ' + target);
    //                    }
    //
    //                }
    //                else if (partIsStepNoTransition(workflowPart, part)) {
    //
    //                    var stepName = part[0]['@attributes']['name'];
    //                    var content = (new XMLSerializer()).serializeToString(xml.getElementsByName(stepName)[0]);
    //                    var thisStepIndex = addOrGetNodeIndex(stepName, content, scope);
    //
    //                }
    //// else if (partIsNotStep) {
    ////                var name = part[0]['@attributes']['name'];
    ////                var content = (new XMLSerializer()).serializeToString(xml.getElementsByName(name)[0]);
    ////                var thisStepIndex = addOrGetNodeIndex(name, content);
    ////
    ////            }
    //                else if (partIsInitialStep(workflowPart)) {
    //
    //                }
    //                else if (partIsContextDataDef(workflowPart)) {
    //                    var thisStepIndex = addOrGetNodeIndex('contextDataDef', '', scope);
    //                }
    //                else {
    //                    deferred.reject('xml parsing found something that makes no sense: ' + JSON.stringify(part))
    //                }
    //            }
    //
    //        }
    function parseUsingXML(deferred, workflowText, scope) {
      scope.graphData = {
        nodes: [],
        links: []
      };
      var serial = new XMLSerializer(), parser = new DOMParser(), xml = parser.parseFromString(workflowText, 'text/xml'), doc = xml.documentElement;
      var list = doc.childNodes, initial = getNamedChildren(doc, 'initialStepName')[0];
      addInitialStep(initial.textContent, serial.serializeToString(initial), scope);
      var contextDataDefs = xml.getElementsByTagName('contextDataDef');
      for (var i = 0; i < contextDataDefs.length; i++) {
        var def = contextDataDefs.item(i), defName = def.getAttribute('name');
        addContextDataDefNode(defName, serial.serializeToString(def), scope);
      }
      // for each child of workflow
      for (var i = 0; i < list.length; i++) {
        var step = list.item(i);
        if (!step.nodeName.match(/^#/)) {
          var stepName = step.getAttribute('name');
          var transitions = getNamedChildren(step, 'transition');
          // if it has transitions, treat as a step
          if (transitions.length > 0) {
            transitions.forEach(function (trans) {
              var condition = trans.getAttribute('condition'), targetStepNameNode = getNamedChildren(trans, 'targetStepName')[0], targetName = targetStepNameNode.textContent, sourceContent = getStepByStepName(list, stepName), sourceIndex = addOrGetNodeIndex(stepName, serial.serializeToString(sourceContent), scope), targetContent = getStepByStepName(list, targetName), targetIndex = addOrGetNodeIndex(targetName, serial.serializeToString(targetContent), scope);
              addLink(sourceIndex, targetIndex, condition, scope);  //console.log('transition from (' + stepName + ') to (' + targetName + ') if ' + condition);
            });
          }
        }
      }
    }
    function addInitialStep(name, content, scope) {
      var index = addOrGetNodeIndex(name, content, scope);
      scope.graphData.nodes[index].initial = true;
    }
    function addContextDataDefNode(name, content, scope) {
      scope.graphData.nodes.push({
        'name': name,
        'content': content,
        'type': 'def'
      });
    }
    function getStepByStepName(list, name) {
      for (var i = 0; i < list.length; i++) {
        var n = list.item(i);
        if (n.attributes && n.getAttribute('name') === name) {
          return n;
        }
      }
      return null;
    }
    function getNamedChildren(elm, name) {
      var ret = [], list = elm.childNodes;
      for (var i = 0; i < list.length; i++) {
        var node = list.item(i);
        if (node.nodeName === name) {
          ret.push(node);
        }
      }
      return ret;
    }
    function addLink(fromIndex, toIndex, condition, scope) {
      scope.graphData.links.push({
        'source': fromIndex,
        'target': toIndex,
        'condition': condition
      });
    }
    function addOrGetNodeIndex(name, content, scope) {
      var exists = -1, nodes = scope.graphData.nodes;
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].name === name) {
          exists = i;
        }
      }
      if (exists > -1) {
        // found it already
        return exists;
      } else {
        // add it
        nodes.push({
          'name': name,
          'content': content,
          'type': 'step'
        });
        return nodes.length - 1;
      }
    }
    function partIsStepWithTransition(name, part) {
      var match = name.match(new RegExp('[sS]tep$'));
      return match && part[0] && part[0]['transition'];
    }
    function partIsStepNoTransition(name, part) {
      var match = name.match(new RegExp('[sS]tep$'));
      return match && part[0] && !part[0]['transition'];
    }
    function partIsNotStep(name, part) {
      var match = name.match(new RegExp('[sS]tep$'));
      return !match;
    }
    function partIsInitialStep(name) {
      return name.match(new RegExp('initialStepName$'));
    }
    function partIsContextDataDef(name) {
      return name.match(new RegExp('contextDataDef$'));
    }
    // very cool, from http://davidwalsh.name/convert-xml-json
    function xmlToJson(xml) {
      // Create the return object
      var obj = {};
      if (xml.nodeType == 1) {
        // element
        // do attributes
        if (xml.attributes.length > 0) {
          obj['@attributes'] = {};
          for (var j = 0; j < xml.attributes.length; j++) {
            var attribute = xml.attributes.item(j);
            obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
          }
        }
      } else if (xml.nodeType == 3) {
        // text
        obj = xml.nodeValue;
      }
      // do children
      if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
          var item = xml.childNodes.item(i);
          var nodeName = item.nodeName;
          if (typeof obj[nodeName] == 'undefined') {
            obj[nodeName] = xmlToJson(item);
          } else {
            if (typeof obj[nodeName].push == 'undefined') {
              var old = obj[nodeName];
              obj[nodeName] = [];
              obj[nodeName].push(old);
            }
            obj[nodeName].push(xmlToJson(item));
          }
        }
      }
      return obj;
    }
    var useXML = function (xmlText, scope) {
      var deferred = $q.defer();
      parseUsingXML(deferred, xmlText, scope);
      return deferred.promise;
    };
    var useJSON = function (xmlText, scope) {
      var deferred = $q.defer();
      //parseUsingJSON(deferred, xmlText, scope);
      return deferred.promise;
    };
    return {
      parseUsingJSON: useJSON,
      parseUsingXML: useXML
    };
  }
]);