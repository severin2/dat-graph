'use strict';

angular.module('graphApp')
    .factory('xmlWorkflowParser', ['$q', function ($q) {

        function parseUsingXML(deferred, workflowText, scope) {

            scope.graphData = { nodes: [], links: [] };

            var serial = new XMLSerializer(),
                parser = new DOMParser(),
                xml = parser.parseFromString(workflowText, 'text/xml'),
                doc = xml.documentElement;

            var list = doc.childNodes,
                initial = getNamedChildren(doc, 'initialStepName')[0];

            addInitialStep(initial.textContent, null, scope);

            var contextDataDefs = xml.getElementsByTagName('contextDataDef');
            for (var i = 0; i < contextDataDefs.length; i++) {
                var def = contextDataDefs.item(i),
                    defName = def.getAttribute('name');
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
                            var condition = trans.getAttribute('condition'),
                                targetStepNameNode = getNamedChildren(trans, 'targetStepName')[0],
                                targetName = targetStepNameNode.textContent,

                                sourceContent = getStepByStepName(list, stepName),
                                sourceIndex = addOrGetNodeIndex(stepName, serial.serializeToString(sourceContent), scope),

                                targetContent = getStepByStepName(list, targetName),
                                targetIndex = addOrGetNodeIndex(targetName, serial.serializeToString(targetContent), scope);

                            addLink(sourceIndex, targetIndex, condition, scope);

                            //console.log('transition from (' + stepName + ') to (' + targetName + ') if ' + condition);
                        })
                    }
                }

            }

            deferred.resolve('success');
        }

        function addInitialStep(name, content, scope) {
            var index = addOrGetNodeIndex(name, content, scope);
            scope.graphData.nodes[index].initial = true;
        }

        function addContextDataDefNode(name, content, scope) {
            scope.graphData.nodes.push({
                "name": name,
                "content": content,
                "type": 'def'
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
            var ret = [],
                list = elm.childNodes;

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
                "source": fromIndex,
                "target": toIndex,
                "condition": condition
            })
        }

        function addOrGetNodeIndex(name, content, scope) {
            var exists = -1,
                nodes = scope.graphData.nodes;

            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].name === name) {
                    if (nodes[i].content === null) {
                        nodes[i].content = content;
                    }
                    exists = i;
                }
            }

            if (exists > -1) { // found it already
                return exists;
            } else { // add it
                nodes.push({
                    "name": name,
                    "content": content,
                    "type": 'step'
                });
                return nodes.length - 1;
            }
        }

        var useXML = function (xmlText, scope) {
            var deferred = $q.defer();

            parseUsingXML(deferred, xmlText, scope);

            return deferred.promise;
        };

        function listifyXMLText(xml) {

            var parser = new DOMParser(),
                xml = parser.parseFromString(xml, 'text/xml')
            return listifyXMLElement(xml);
        }

        function listifyXMLElement(xml) {

            var serial = new XMLSerializer(),
                main = xml.documentElement,
                children = main.childNodes,
                attributes = main.attributes;

            alert(serial.serializeToString(main));
//            var ch = [], att = [], name = serial.serializeToString(xml.documentElement);
//
//            for (var i = 0; i < children.length; i++) {
//                ch[i] = serial.serializeToString(children.item(i).);
//            }
//
//            for (var i = 0; i < attributes.length; i++) {
//                att[i] = serial.serializeToString(attributes.item(i));
//            }
//
//
//            return {"name": name, "children": ch, "attributes": att};

        }

        return {
            parseUsingXML: useXML,
            listifyXMLElement: listifyXMLElement,
            listifyXMLTest: listifyXMLText
        };
    }]);
