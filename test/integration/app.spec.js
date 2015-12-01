'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const request = require('supertest-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const should = chai.should();

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('Express Wrapper', function () {
  const ExpressWrapper = require('../../');

  let sandbox;
  let config;

  beforeEach(function () {
    config = ExpressWrapper.ExpressConfig.getConfig({});
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('constructor', function () {
    it('should throw if given no configuration', function () {
      (function () {
        return new ExpressWrapper();
      }).should.throw(Error);
    });
  });

  describe('routes', function () {
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

  describe('subclassOrRun', function () {
    it('should return a class when given a module with a parent', function () {
      const WrapperClass = ExpressWrapper.subclassOrRun({ parent: true });

      should.exist(WrapperClass);

      WrapperClass.should.be.a('function').and.equal(ExpressWrapper);
    });

    it('should return a subclass when given new properties', function () {
      const WrapperClass = ExpressWrapper.subclassOrRun({ parent: true }, {}, {
        foo: 'bar',
      });

      should.exist(WrapperClass);

      WrapperClass.should.be.a('function');
      WrapperClass.should.have.property('__super__', ExpressWrapper.prototype);
      WrapperClass.should.have.deep.property('prototype.foo', 'bar');

      ExpressWrapper.should.not.have.deep.property('prototype.foo');
    });

    it('should run when given a module with no parent', function () {
      const ConstructorSpy = sandbox.spy(ExpressWrapper);
      const runnerStub = sandbox.stub(ExpressWrapper.ExpressRunner.prototype, 'runUntilKillSignal');
      const configStub = sandbox.stub(ExpressWrapper.ExpressConfig, 'getConfig');

      configStub.returns(config);

      const WrapperClass = ConstructorSpy.subclassOrRun({ parent: undefined });

      should.exist(WrapperClass);

      WrapperClass.should.be.a('function').and.equal(ConstructorSpy);

      configStub.should.have.been.calledOnce;
      configStub.should.have.been.calledBefore(ConstructorSpy);

      ConstructorSpy.should.have.been.calledOnce;
      ConstructorSpy.should.have.been.calledBefore(runnerStub);
      ConstructorSpy.should.have.been.calledWithNew;
      ConstructorSpy.should.have.been.calledWith(config);

      runnerStub.should.have.been.calledOnce;
    });

    it('should run a subclass when also subclassing', function () {
      const ConstructorSpy = sandbox.spy(ExpressWrapper);
      const configStub = sandbox.stub(ExpressWrapper.ExpressConfig, 'getConfig');

      sandbox.stub(ExpressWrapper.ExpressRunner.prototype, 'runUntilKillSignal');

      configStub.returns(config);

      const WrapperClass = ConstructorSpy.subclassOrRun({ parent: undefined }, {}, {
        foo: 'bar',
      });

      should.exist(WrapperClass);

      WrapperClass.should.be.a('function');
      WrapperClass.should.have.property('__super__', ExpressWrapper.prototype);
      WrapperClass.should.have.deep.property('prototype.foo', 'bar');

      ConstructorSpy.should.have.been.calledOnce;
      ConstructorSpy.should.have.been.calledWith(config);

      should.exist(ConstructorSpy.thisValues[0]);
      should.exist(ConstructorSpy.thisValues[0].foo);

      ConstructorSpy.thisValues[0].foo.should.equal('bar');
    });
  });
});
