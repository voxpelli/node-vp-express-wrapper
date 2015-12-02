'use strict';

// TODO: Add documentation

const ExpressWrapper = require('./lib/wrapper');

ExpressWrapper.ExpressConfig = require('./lib/config');
ExpressWrapper.ExpressRunner = require('./lib/runner');

ExpressWrapper.envConfigPrefix = 'EXPRESS_WRAPPER_';

ExpressWrapper.subclassOrRun = function (currentModule, options, protoProps, staticProps) {
  let WrapperClass = protoProps ? this.extend(protoProps, staticProps) : this;

  if (currentModule.parent) { return WrapperClass; }

  delete require.cache[currentModule.filename];

  options = options || {};

  let ExpressRunner = WrapperClass.ExpressRunner;
  let ExpressConfig = WrapperClass.ExpressConfig;

  let config = ExpressConfig.getConfig(options.env, options.prefix || WrapperClass.envConfigPrefix);

  let wrapperInstance = new WrapperClass(config, options);
  let runnerInstance = new ExpressRunner(wrapperInstance);

  runnerInstance.runUntilKillSignal();

  return WrapperClass;
};

module.exports = ExpressWrapper.subclassOrRun(module);
