// show the light

var fs = require('fs');

var csscolors = require('css-color-names');
var deepmerge = require('deepmerge');
var rgb2hsl = require('color-convert').rgb2hsl;
var mired = require('mired');
var yaml = require('yamljs');

var common = require('../common');

module.exports = light;

function light(subcmd, opts, args, cb) {
  if (opts.help) {
    this.do_help('help', {}, [subcmd], cb);
    return;
  }

  var id = parseInt(args.shift(), 10);

  if (isNaN(id)) {
    cb(new Error('first argument must be a number'));
    return;
  }

  // figure out what the user wants
  var command = args.shift();

  // get light information only
  if (command === undefined) {
    this.client.light(id, function(err, data) {
      if (err) {
        cb(err);
        return;
      }

      var s;
      if (opts.json)
        s = JSON.stringify(data, null, 2);
      else
        s = yaml.stringify(data);

      console.log(s);
      cb();
    });
    return;
  }

  // create a light state object
  var state = common.createLightState(command, args);
  if (state instanceof Error) {
    cb(state);
    return;
  }
  this.debug('state = %s', JSON.stringify(state));

  this.client.setLightState(id, state, function(err, data) {
    if (err) {
      cb(err);
      return;
    }

    var s;
    if (opts.json)
      s = JSON.stringify(data, null, 2);
    else
      s = yaml.stringify(data);

    console.log(s);
    cb();
  });
}

light.options = [
  {
    names: ['help', 'h'],
    type: 'bool',
    help: 'Show this help.'
  },
  {
    names: ['json', 'j'],
    type: 'bool',
    help: 'JSON output.'
  }
];
light.help = 'show the hue light\n{{options}}';
