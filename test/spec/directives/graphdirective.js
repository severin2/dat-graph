'use strict';

describe('Directive: graphDirective', function () {

  // load the directive's module
  beforeEach(module('graphApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<graph-directive></graph-directive>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the graphDirective directive');
  }));
});
