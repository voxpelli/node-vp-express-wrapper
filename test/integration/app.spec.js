'use strict';

const request = require('supertest-as-promised');

describe('Express Wrapper App', function () {
  const ExpressWrapper = require('../../');

  describe('basic', function () {
    it('should return a web page on the "/" path', function () {
      const protoProps = {};

      protoProps.getRoutes = function () {
        return {
          '/': function (req, res) {
            res.send('<p>some html</p>');
          },
        };
      };

      const WrapperClass = ExpressWrapper.extend(protoProps);

      const config = ExpressWrapper.ExpressConfig.getDefaultConfig({});

      const wrapperInstance = new WrapperClass(config);
      const app = wrapperInstance.getApp();

      return request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8');
    });
  });
});
