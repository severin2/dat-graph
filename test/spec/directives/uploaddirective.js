'use strict';

describe('Directive: uploadDirective', function () {

  // load the directive's module
  beforeEach(module('graphApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<upload-directive></upload-directive>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the uploadDirective directive');
  }));
});
