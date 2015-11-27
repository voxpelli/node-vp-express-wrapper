'use strict';

// TODO: Add documentation

const ExpressWrapper = require('./lib/wrapper');
const ExpressConfig = require('./lib/config');
const ExpressRunner = require('./lib/runner');

ExpressWrapper.ExpressConfig = ExpressConfig;
ExpressWrapper.ExpressRunner = ExpressRunner;

ExpressWrapper.envConfigPrefix = 'EXPRESS_WRAPPER_';

ExpressWrapper.subclassOrRun = function (currentModule, options, protoProps, staticProps) {
  let WrapperClass = protoProps ? this.extend(protoProps, staticProps) : this;

  if (currentModule.parent) { return WrapperClass; }

  options = options || {};

  let ExpressRunner = WrapperClass.ExpressRunner;
  let ExpressConfig = WrapperClass.ExpressConfig;

  let config = ExpressConfig.getDefaultConfig(options.env, options.prefix || this.envConfigPrefix);

  let wrapperInstance = new WrapperClass(config, options);
  let runnerInstance = new ExpressRunner(wrapperInstance);

  runnerInstance.runUntilKillSignal();
};

module.exports = ExpressWrapper.subclassOrRun(module);
