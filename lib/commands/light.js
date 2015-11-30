// show the light

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
  var state = {
    on: true
  };

  var match;
  if (command === 'on') {
    state.on = true;
  } else if (command === 'off') {
    state.on = false;
  } else if (command === 'reset') {
    state.alert = 'none';
    state.effect = 'none';
  } else if (command === 'colorloop') {
    state.effect = 'colorloop';
  } else if ((match = command.match(/^([0-9]+)[kK]$/))) {
    var kelvin = +match[1];
    var ct = mired.kelvinToMired(kelvin);
    state.ct = Math.round(ct);
  } else {
    var hex = csscolors[command];

    if (!hex) {
      match = command.match(/^#?(([0-9A-Fa-f]{3})|([0-9A-Fa-f]{6}))$/);
      if (!match) {
        cb(new Error('failed to parse command'));
        return;
      }
      hex = match[1];
    }

    this.debug('hex: %s', hex);
    var rgb = common.hex2rgb(hex);
    this.debug('rgb: %s', rgb);
    var hsl = rgb2hsl(rgb);
    this.debug('hsl: %s', hsl);
    state.hue = Math.round(hsl[0] / 360 * 65535);
    state.sat = Math.round(hsl[1] / 100 * 254);
    state.bri = Math.round(hsl[2] / 100 * 254);
  }

  // parse extra options to merge into the state object
  var extraOpts;
  try {
    extraOpts = common.kvToObj(args, {autocast: true});
  } catch (e) {
    cb(e);
    return;
  }

  state = deepmerge(state, extraOpts);
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
