'use strict';

describe('Service: D3service', function () {

  // load the service's module
  beforeEach(module('yoApp'));

  // instantiate service
  var D3service;
  beforeEach(inject(function (_D3service_) {
    D3service = _D3service_;
  }));

  it('should do something', function () {
    expect(!!D3service).toBe(true);
  });

});
