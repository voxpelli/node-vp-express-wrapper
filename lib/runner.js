'use strict';

const http = require('http');

const extend = require('backbone-extend-standalone');

const ExpressRunner = function (wrapperInstance, options) {
  this.wrapperInstance = wrapperInstance;

  this.logger = wrapperInstance.logger;
  this.config = wrapperInstance.config;
};

ExpressRunner.extend = extend;

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

module.exports = ExpressRunner;
