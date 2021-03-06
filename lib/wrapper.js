'use strict';

const util = require('util');
const EventEmitter = require('events');

const basicAuth = require('basic-auth');
const compression = require('compression');
const emitThen = require('emit-then');
const express = require('express');
const extend = require('backbone-extend-standalone');

// TODO: Replace with vhost module?
const ensureSingleHost = function (wrapperInstance, req, res, next) {
  var port = req.headers['x-forwarded-port'] || wrapperInstance.app.get('port');
  var https = false;

  if (port + '' === '443') {
    https = true;
    port = '';
  } else {
    port = (port + '' === '80' ? '' : ':' + port);
  }

  if (
    !wrapperInstance.config.host ||
    !wrapperInstance.config.hostEnforce ||
    (
      (req.hostname + port) === wrapperInstance.config.host &&
      (https === wrapperInstance.config.hostHttps)
    )
  ) {
    return next();
  }

  // Let CSS and JS through, to enable eg. https-hosting on Heroku
  if (req.url.indexOf('.css') !== -1 || req.url.indexOf('.js') !== -1) { return next(); }

  res.redirect((wrapperInstance.config.hostHttps ? 'https' : 'http') + '://' + wrapperInstance.config.host + req.url);
};

const ExpressWrapper = function (config, options) {
  EventEmitter.call(this);

  if (!config) {
    throw new Error('Config is required');
  }

  options = options || {};

  this.config = config;
  this.logger = options.logger || this._createLogger();
};

util.inherits(ExpressWrapper, EventEmitter);

ExpressWrapper.extend = extend;

ExpressWrapper.prototype.emitThen = emitThen;

ExpressWrapper.prototype.getApp = function () {
  if (this.app) { return this.app; }

  this.app = express();

  this._appConfig();
  this._middlewareSetup();
  this._routeSetup();
  this._postRouteSetup();

  return this.app;
};

ExpressWrapper.prototype.getRoutes = function () {
  return {
    '/': function (req, res) {
      res.send('<h1>Hello World!</h1>');
    },
  };
};

ExpressWrapper.prototype.close = function () {
  return this
    .emitThen('close')
    .then(() => this.emitThen('closed'));
};

ExpressWrapper.prototype._createLogger = function () {
  return require('bunyan-duckling');
};

ExpressWrapper.prototype._appConfig = function () {
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
  this.app.use(function (req, res) {
    res.sendStatus(404);
  });

  if (this.app.get('env') === 'development') {
    this.app.use(require('errorhandler')());
  }
};

module.exports = ExpressWrapper;
