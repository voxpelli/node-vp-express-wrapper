'use strict';

const http = require('http');

const extend = require('backbone-extend-standalone');

const ExpressRunner = function (wrapperInstance, options) {
  this.wrapperInstance = wrapperInstance;

  this.logger = wrapperInstance.logger;
  this.config = wrapperInstance.config;
};

ExpressRunner.extend = extend;
ExpressRunner.envConfigPrefix = 'EXPRESS_WRAPPER_';

ExpressRunner.prototype.close = function () {
  return this.wrapperInstance.close();
};

ExpressRunner.prototype.getServer = function () {
  if (this.httpServer) { return this.httpServer; }

  this.httpConnections = {};

  this.httpServer = http.createServer(this.wrapperInstance.getApp());
  this.httpServer.on('connection', conn => {
    var key = conn.remoteAddress + ':' + conn.remotePort;

    this.httpConnections[key] = conn;

    conn.on('close', () => {
      delete this.httpConnections[key];
    });
  });

  return this.httpServer;
};

ExpressRunner.prototype.startServer = function () {
  let httpServer = this.getServer();
  let port = this.wrapperInstance.getApp().get('port');

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

ExpressRunner.prototype.runUntilKillSignal = function () {
  var closeServer = this.startServer();

  if (this.config.dev.cleanUpOnSigint) {
    process.on('SIGINT', closeServer);
  }
  process.on('SIGTERM', closeServer);
};

ExpressRunner._getDefaultEnv = function (env, prefix) {
  if (typeof env === 'string') {
    require('dotenv').config({path: env});
  } else if (!process.env[prefix + 'PREFIX'] && !process.env[prefix + 'HOST']) {
    require('dotenv').load();
  }

  return process.env;
};

ExpressRunner.getDefaultConfig = function (env, prefix) {
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

module.exports = ExpressRunner;
