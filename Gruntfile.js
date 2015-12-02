'use strict';

var lintlovin = require('lintlovin');

module.exports = function (grunt) {
  lintlovin.initConfig(grunt, {}, {
    enableCoverageEvent: true,
    alwaysIntegration: true,
    integrationTravis: true,
  });

  grunt.event.on('coverage', function (lcov, done) {
    if (!process.env.TRAVIS) { return done(); }

    require('coveralls').handleInput(lcov, function (err) {
      if (err) { return done(err); }
      done();
    });
  });
};
