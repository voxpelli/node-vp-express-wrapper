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
    require('dotenv').config({
      path: path,
      silent: true,
    });

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

  env.NODE_ENV = env.NODE_ENV || 'development';

  return this._mapEnvToConfig(env, prefix);
};

ExpressConfig._mapEnvToConfig = function (env, prefix) {
  return {
    env: env.NODE_ENV,
    port: parseInt(env.PORT, 10) || 5000,

    // Development specific configurations

    dev: env.NODE_ENV === 'production' ? {} : {
      cleanUpOnSigint: env[prefix + 'DEV_SIGINT_CLEANUP'],
    },

    // Application specific configurations

    host: env[prefix + 'HOST'],
    hostEnforce: !env[prefix + 'HOST_DONT_ENFORCE'],
    webAuth: {
      user: env[prefix + 'WEB_USER'],
      pass: env[prefix + 'WEB_PASS'],
    },
  };
};

module.exports = ExpressConfig;
