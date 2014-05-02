'use strict';

describe('Service: Xmlworkflowservice', function () {

  // load the service's module
  beforeEach(module('graphApp'));

  // instantiate service
  var Xmlworkflowservice;
  beforeEach(inject(function (_Xmlworkflowservice_) {
    Xmlworkflowservice = _Xmlworkflowservice_;
  }));

  it('should do something', function () {
    expect(!!Xmlworkflowservice).toBe(true);
  });

});
