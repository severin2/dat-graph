'use strict';

angular.module('graphApp')
    .factory('xmlWorkflowParser', ['$q', function ($q) {

        function parseUsingXML(deferred, workflowText, scope) {

            scope.graphData = { nodes: [], links: [] };

            var parser = new DOMParser(),
                xml = parser.parseFromString(workflowText, 'text/xml'),
                doc = xml.documentElement;

            var list = doc.childNodes,
                // there is only every one initial step element
                initial = getNamedChildren(doc, 'initialStepName')[0];

            // add the initial step name
            addInitialStep(initial.textContent, scope);

            var contextDataDefs = xml.getElementsByTagName('contextDataDef');

            for (var i = 0; i < contextDataDefs.length; i++) {
                var def = contextDataDefs.item(i),

                    defObj = attributesToObj(def);

                console.log('data def: ' + JSON.stringify(defObj));
                addContextDataDefNode(defObj, scope);
            }

            // for each child of workflow
            for (var i = 0; i < list.length; i++) {
                var step = list.item(i);

                // skip initial step
                if(step.tagName === 'initialStepName') {
                    continue;
                }

                // skip this one... TODO what was the purpose of this check for # ?
                if(step.nodeName.match(/^#/)) {
                    continue;
                }

                var stepObj = attributesToObj(step);
                console.log('step obj: ' + JSON.stringify(stepObj));

                var transitions = getNamedChildren(step, 'transition');

                // for every transition, connect the nodes
                transitions.forEach(function (trans) {
                    var condition = trans.getAttribute('condition'),
                        targetStepNameNode = getNamedChildren(trans, 'targetStepName')[0],
                        targetName = targetStepNameNode.textContent,

                        targetObj = {name:targetName},

                        sourceIndex = addStepNode(stepObj, scope),
                        targetIndex = addStepNode(targetObj,  scope);

                    addLink(sourceIndex, targetIndex, condition, scope);
                })


            }

            deferred.resolve('success');
        }

        /**
         *
         * @param name
         * @param scope
         */
        function getNodeObjByName(name,scope) {

            var nodes = scope.graphData.nodes;

            nodes.forEach(function(node) {
               if(node.name == name) {}
                return node;
            });
        }

        /**
         *
         * given an xml element, returns a JS object whose object properties
         * are the attributes of that xml element
         *
         * @param el
         * @returns {{}}
         */
        function attributesToObj(el) {
            var atts = el.attributes,
                obj = {};

            for(var j =0; j < atts.length; j++)  {
                obj[atts[j].name] = atts[j].value;
            }

            return obj;
        }

        /**
         *
         *
         * @param nameArg
         * @param scope
         */
        function addInitialStep(nameArg, scope) {
            var index = addStepNode({name:nameArg}, scope);
            scope.graphData.nodes[index].initial = true;
        }

        /**
         * add a contextDataDef to the nodes
         *
         * @param obj
         * @param scope
         * @returns {*}
         */
        function addContextDataDefNode(obj, scope) {
            return addOrGetNodeIndex({
                "name": obj.name || "no name",
                "dataType": obj.dataType || "no data type",
                "defaultDataExpression" :  obj.defaultDataExpression || "no default data expression",
                "userInput" : obj.userInput || false,
                "required" : obj.required || false,
                "label" : obj.label || "no label",
                "type": 'def'
            }, scope);
        }

        /**
         * add a step to the nodes
         *
         * @param obj
         * @param scope
         * @returns {*}
         */
        function addStepNode(obj,scope) {
            return addOrGetNodeIndex({
                "name" : obj.name || "no name",
                "executionLabelExpression" : obj.executionLabelExpression || "no execution label expression",
                "mediaConversionTemplateExpression" : obj.mediaConversionTemplateExpression || "no media conversion template expression",
                "targetContentTemplateExpression": obj.targetContentTemplateExpression || "no target content tempalte expression",
                "sourceFileExpression": obj.sourceFileExpression || "no source file expression",
                "pctComplete" : obj.pctComplete || "no pct complete",
                "resultDataDef" : obj.resultDataDef || "no result data def",
                "subjectChangePath" : obj.subjectChangePath || "no subject change path",
                "targetWorkflowId" : obj.targetWorkflowId || "no target workflow id",
                "type": 'step'
            }, scope);
        }

        /**
         * search through the xml element's children for elements of specified element type
         *
         * @param elm
         * @param name
         * @returns {Array}
         */
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

        /**
         * add a link
         *
         * @param fromIndex
         * @param toIndex
         * @param condition
         * @param scope
         */
        function addLink(fromIndex, toIndex, condition, scope) {
            scope.graphData.links.push({
                "source": fromIndex,
                "target": toIndex,
                "condition": condition
            })
        }

        /**
         * create a node or get the index of the existing node
         *
         * @param obj
         * @param scope
         * @returns {number}
         */
        function addOrGetNodeIndex(obj, scope) {
            var nodes = scope.graphData.nodes;

            for (var i = 0; i < nodes.length; i++) {
                // the node might have been added by name but not filled with content, synchronize
                if (nodes[i].name == obj.name) {
                    nodes[i] = obj;
                    return i;
                }
            }
            // didn't find it, so add it
            nodes.push( obj );
            return nodes.length - 1;

        }

        /**
         * PUBLIC METHOD
         *
         * parses text into an xml document structure
         *
         * @param xmlText
         * @param scope
         * @returns {*}
         */
        var useXML = function (xmlText, scope) {
            var deferred = $q.defer();

            parseUsingXML(deferred, xmlText, scope);

            return deferred.promise;
        };

        /**
         * PUBLIC METHOD
         *
         * parse as xml, turn into a list
         *
         * purpose = idunno
         *
         * @param xml
         * @returns {*}
         */
        function listifyXMLText(xml) {

            var parser = new DOMParser(),
                xml = parser.parseFromString(xml, 'text/xml')
            return listifyXMLElement(xml);
        }

        /**
         * PUBLIC METHOD
         *
         * purpose = i really dunno
         *
         * @param xml
         */
        function listifyXMLElement(xml) {

            var serial = new XMLSerializer(),
                main = xml.documentElement,
                children = main.childNodes,
                attributes = main.attributes;

            console.log(serial.serializeToString(main));
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
