'use strict';

const extend = require('backbone-extend-standalone');

const ExpressConfig = function () {};

ExpressConfig.extend = extend;

ExpressConfig.getEnv = function (env, prefix) {
  let path;

  if (typeof env === 'string') {
    path = env;
    env = undefined;
  }

  env = Object.assign({}, env || process.env);

  prefix = prefix || '';

  if (!env[prefix + 'HOST'] && !env[prefix + 'PREFIX']) {
    require('dotenv').config({path: path});

    env = Object.assign(env, process.env);
  }

  return env;
};

ExpressConfig.getConfig = function (env, prefix) {
  env = this.getEnv(env, prefix);

  prefix = prefix || '';

  if (env[prefix + 'PREFIX']) {
    prefix = env[prefix + 'PREFIX'];
  }

  let nodeEnv = env.NODE_ENV || 'development';

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
