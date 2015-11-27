'use strict';

// TODO: Add documentation

const ExpressWrapper = require('./lib/wrapper');
const ExpressRunner = require('./lib/runner');

ExpressWrapper.ExpressRunner = ExpressRunner;

ExpressWrapper.subclassOrRun = function (currentModule, options, protoProps, staticProps) {
  let WrapperClass = protoProps ? this.extend(protoProps, staticProps) : this;

  if (currentModule.parent) { return WrapperClass; }

  options = options || {};

  let ExpressRunner = WrapperClass.ExpressRunner;

  let config = ExpressRunner.getDefaultConfig(options.env, options.prefix);

  let wrapperInstance = new WrapperClass(config, options);
  let runnerInstance = new ExpressRunner(wrapperInstance);

  runnerInstance.runUntilKillSignal();
};

module.exports = ExpressWrapper.subclassOrRun(module);
