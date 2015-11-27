'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const request = require('supertest-as-promised');

chai.use(chaiAsPromised);
chai.should();

describe('Express Wrapper App', function () {
  const ExpressWrapper = require('../../');

  let config;

  beforeEach(function () {
    config = ExpressWrapper.ExpressConfig.getDefaultConfig({});
  });

  describe('basic', function () {
    it('should return a web page on the "/" path', function () {
      const wrapperInstance = new ExpressWrapper(config);
      const app = wrapperInstance.getApp();

      return request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .should.eventually.have.property('text')
          .that.is.a('string')
          .that.equals('<h1>Hello World!</h1>');
    });

    it('should allow overriding the "/" path', function () {
      const protoProps = {};

      protoProps.getRoutes = function () {
        return {
          '/': function (req, res) {
            res.send('<p>some html</p>');
          },
        };
      };

      const WrapperClass = ExpressWrapper.extend(protoProps);

      const wrapperInstance = new WrapperClass(config);
      const app = wrapperInstance.getApp();

      return request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .should.eventually.have.property('text')
          .that.is.a('string')
          .that.equals('<p>some html</p>');
    });

    it('should allow removing the "/" path', function () {
      const protoProps = {};

      protoProps.getRoutes = function () {
        return {};
      };

      const WrapperClass = ExpressWrapper.extend(protoProps);

      const wrapperInstance = new WrapperClass(config);
      const app = wrapperInstance.getApp();

      return request(app)
        .get('/')
        .expect(404);
    });

    it('should support locking down app through basic authentication', function () {
      config.webAuth = {
        user: 'foo',
        pass: 'bar',
      };

      const wrapperInstance = new ExpressWrapper(config);
      const app = wrapperInstance.getApp();

      return request(app)
        .get('/')
        .expect(401)
        .then(() =>
          request(app)
            .get('/')
            .auth('foo', 'bar')
            .expect(200)
        );
    });
  });
});
