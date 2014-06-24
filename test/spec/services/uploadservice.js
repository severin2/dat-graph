'use strict';

describe('Service: Uploadservice', function () {

  // load the service's module
  beforeEach(module('graphApp'));

  // instantiate service
  var Uploadservice;
  beforeEach(inject(function (_Uploadservice_) {
    Uploadservice = _Uploadservice_;
  }));

  it('should do something', function () {
    expect(!!Uploadservice).toBe(true);
  });

});
