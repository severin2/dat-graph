'use strict';

describe('Controller: GraphcontrollerCtrl', function () {

  // load the controller's module
  beforeEach(module('graphApp'));

  var GraphcontrollerCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GraphcontrollerCtrl = $controller('GraphcontrollerCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
