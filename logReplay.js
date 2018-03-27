#!/usr/bin/env node

var program = require('commander')
  , replayer = require('./replayer');
 
program
  .version('1.0.0')
  .usage('[options] <log file>')
  .arguments('<file>')
  .option('-o, --output [file]', 'result file', './result.log')
  .option('-r, --host [host]', 'host', 'localhost')
  .option('-t, --throttle [delay]', 'throttle (actual time/throttle)', 1)
  .option('-s, --skip [count]', 'skip the first [count] inital rows', 0)
  .option('-i, --include-static', 'include requests to static resources')
  .action(function(file, options) {

    options.includeStatic = !!options.includeStatic;

    console.log('log file = %s', file);
    console.log('output   = %s', options.output);
    console.log('host     = %s', options.host);
    console.log('throttle = %s', options.throttle);
    console.log('skip     = %s', options.skip);
    console.log('static   = %s', options.includeStatic);

    replayer.start(file, options.output, options.host, options.throttle, options.skip, options.includeStatic);

  }).parse(process.argv);

if (program.args.length === 0) program.help();