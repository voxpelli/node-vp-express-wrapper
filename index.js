'use strict';

const util = require('util');
const http = require('http');
const EventEmitter = require('events');

const basicAuth = require('basic-auth');
const compression = require('compression');
const emitThen = require('emit-then');
const express = require('express');
const extend = require('backbone-extend-standalone');
const logger = require('bunyan-duckling');

// TODO: Change all `page` vars to be named `app`, `that` or `appInstance` or something
// TODO: Use arrow functions
// TODO: Add the middleware that ensures a single host
// TODO: Add documentation

// TODO: Replace with vhost module?
const ensureSingleHost = function (wrapperInstance, req, res, next) {
  var port = req.headers['x-forwarded-port'] || wrapperInstance.app.get('port');
  port = (port + '' === '80' ? '' : ':' + port);
  if (!wrapperInstance.config.host || (req.hostname + port) === wrapperInstance.config.host) { return next(); }
  // Let CSS and JS through, to enable eg. https-hosting on Heroku
  if (req.url.indexOf('.css') !== -1 || req.url.indexOf('.js') !== -1) { return next(); }
  res.redirect(req.protocol + '://' + wrapperInstance.config.host + req.url);
};

const ExpressWrapper = function (options) {
  EventEmitter.call(this);

  options = options || {};

  this.logger = options.logger || logger;
  this.config = this.constructor.getDefaultConfig(options.env, options.prefix);
};

util.inherits(ExpressWrapper, EventEmitter);

ExpressWrapper.emitThen = emitThen;
ExpressWrapper.extend = extend;

ExpressWrapper.envConfigPrefix = 'EXPRESS_WRAPPER_';

ExpressWrapper.prototype.getApp = function () {
  if (this.app) { return this.app; }

  this.app = express();

  this._expressAppConfig();
  this._middlewareSetup();
  this._routeSetup();
  this._postRouteSetup();
  // TODO: Add some routes etc

  return this.app;
};

ExpressWrapper.prototype.getRoutes = function () {
  return {};
};

ExpressWrapper.prototype._expressAppConfig = function () {
  this.app.enable('case sensitive routing');
  this.app.enable('strict routing');
  this.app.disable('x-powered-by');
  this.app.set('env', this.config.env);
  this.app.set('port', this.config.port);
};

ExpressWrapper.prototype._middlewareSetup = function () {
  var config = this.config;

  if (config.webAuth.user) {
    this.app.use(function (req, res, next) {
      var credentials = basicAuth(req);

      if (
        !credentials ||
        config.webAuth.user !== credentials.name ||
        (config.webAuth.pass || '') !== credentials.pass
      ) {
        res.setHeader('WWW-Authenticate', 'Basic');
        res.sendStatus(401);
      } else {
        next();
      }
    });
    this.app.use(express.basicAuth(function (user, pass) {
      return config.webAuth.user === user && (config.webAuth.pass || '') === pass;
    }));
  }
  this.app.use(ensureSingleHost.bind(undefined, this));
  this.app.use(compression());
};

ExpressWrapper.prototype._routeSetup = function () {
  let routes = this.getRoutes();

  for (let path in routes) {
    this.app.use(path, routes[path]);
  }
};

ExpressWrapper.prototype._postRouteSetup = function () {
  if (this.app.get('env') === 'development') {
    this.app.use(require('errorhandler'));
  }
};

ExpressWrapper.prototype.close = function () {
  return this
    .emitThen('close')
    .then(() => this.emitThen('close-complete'));
};

ExpressWrapper.prototype.getServer = function () {
  if (this.httpServer) { return this.httpServer; }

  this.httpConnections = {};

  this.httpServer = http.createServer(this.getApp());
  this.httpServer.on('connection', conn => {
    var key = conn.remoteAddress + ':' + conn.remotePort;

    this.httpConnections[key] = conn;

    conn.on('close', () => {
      delete this.httpConnections[key];
    });
  });

  return this.httpServer;
};

ExpressWrapper.prototype.startServer = function () {
  let httpServer = this.getServer();
  let port = this.getApp().get('port');

  httpServer.listen(port, () => {
    this.logger.info('Server started. Listening on port ' + port);
  });

  return () => {
    let timeout;

    if (!httpServer) {
      return;
    }

    this.logger.info('Getting ready to shut down. Cleaning up...');

    if (this.httpConnections) {
      // Sometimes we have to force connections to end
      timeout = setTimeout(
        () => {
          this.logger.info('...actively closing server connections...');
          for (let key in this.httpConnections) {
            this.httpConnections[key].end();
          }
        },
        this.config.env === 'production' ? 5000 : 1000
      );
    }

    httpServer.close(() => {
      if (timeout) {
        // We don't always have to force connections to close
        clearTimeout(timeout);
      }

      this.close().done(() => {
        this.logger.info('...fully cleaned up! Shutting down.');
      });
    });

    httpServer = false;
  };
};

ExpressWrapper.prototype.runUntilKillSignal = function () {
  var closeServer = this.startServer();

  if (this.config.dev.cleanUpOnSigint) {
    process.on('SIGINT', closeServer);
  }
  process.on('SIGTERM', closeServer);
};

ExpressWrapper._getDefaultEnv = function (env, prefix) {
  if (typeof env === 'string') {
    require('dotenv').config({path: env});
  } else if (!process.env[prefix + 'PREFIX'] && !process.env[prefix + 'HOST']) {
    require('dotenv').load();
  }

  return process.env;
};

ExpressWrapper.getDefaultConfig = function (env, prefix) {
  prefix = prefix || this.envConfigPrefix;

  if (!env || typeof env === 'string') {
    env = this._getDefaultEnv(env, prefix);
  }

  prefix = env[prefix + 'PREFIX'] || prefix;

  var nodeEnv = env.NODE_ENV || 'development';

  return {
    env: nodeEnv,
    port: parseInt(env.PORT, 10) || 5000,

    // Development specific configurations

    dev: nodeEnv === 'production' ? {} : {
      cleanUpOnSigint: env[prefix + 'DEV_SIGINT_CLEANUP'],
    },

    // Application specific configurations

    host: env[prefix + 'HOST'],
    webAuth: {
      user: env[prefix + 'WEB_USER'],
      pass: env[prefix + 'WEB_PASS'],
    },
  };
};

ExpressWrapper.subclassOrRun = function (currentModule, options, protoProps, staticProps) {
  var NewClass = protoProps ? this.extend(protoProps, staticProps) : this;

  if (currentModule.parent) {
    return NewClass;
  } else {
    var classInstance = new NewClass(options);
    classInstance.runUntilKillSignal();
  }
};

module.exports = ExpressWrapper.subclassOrRun(module);
