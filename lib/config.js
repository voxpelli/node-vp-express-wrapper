'use strict';

const extend = require('backbone-extend-standalone');

const ExpressConfig = function () {};

ExpressConfig.extend = extend;

ExpressConfig.getDefaultEnv = function (env, prefix) {
  if (typeof env === 'string') {
    require('dotenv').config({path: env});
  } else if (!process.env[prefix + 'PREFIX'] && !process.env[prefix + 'HOST']) {
    require('dotenv').load();
  }

  return process.env;
};

ExpressConfig.getDefaultConfig = function (env, prefix) {
  prefix = prefix || '';

  if (!env || typeof env === 'string') {
    env = this.getDefaultEnv(env, prefix);
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

module.exports = ExpressConfig;
