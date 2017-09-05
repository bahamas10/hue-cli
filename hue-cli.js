#!/usr/bin/env node
/**
 * Hue Command Line Interface
 *
 * Author: Dave Eddy <dave@daveeddy.com>
 * Date: 3/14/13
 * License: MIT
 */
var fs = require('fs');
var path = require('path');
var util = require('util');

var csscolors = require('css-color-names');
var getopt = require('posix-getopt');
var Hue = require('hue.js');
var sprintf = require('extsprintf').sprintf;
function printf() { console.log(sprintf.apply(this, arguments)); }

var package = require('./package.json');

var app = 'node-hue-cli';
var homedir = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
var configfile = path.join(homedir, '.hue.json');
var config;

/**
 * return the usage statement
 */
function usage() {
  return [
    'Usage: hue [-H host] [--json] [command]',
    '',
    'control philips hue over the command line',
    '',
    'examples',
    '  hue config                  # view the hue config',
    '  hue lights                  # get a list of lights',
    '  hue lights 5                # get information about light 5',
    '  hue lights 5,6,7 on         # turn lights 5 6 and 7 on',
    '  hue lights on               # turn all lights on',
    '  hue lights 1 ff0000         # turn light 1 red',
    '  hue lights 1 red            # same as above',
    '  hue lights 1 +10            # increase the brightness by 10',
    '  hue lights 1 -10            # decrease the brightness by 10',
    '  hue lights 1 =100           # set the brightness to 100',
    '  hue lights 4,5 colorloop    # enable the colorloop effect on lights 4 and 5',
    '  hue lights 4,5 alert        # blink lights 4 and 5 for 30 seconds',
    '  hue lights 4,5 clear        # clear any effects on lights 4 and 5',
    '  hue lights 1 state          # set the state on light 1 as passed in as JSON over stdin',
    '  hue rename 1 light-name     # set light 1\'s name to the given string',
    '  hue lights reset            # reset all lamps to default (on, as if the bulb was just flipped on)',
    '  hue lights 1,2 reset        # reset just bulbs 1 and 2',
    '  hue help                    # this message',
    '  hue register                # register this app to hue',
    '  hue search                  # search for hue base stations',
    '',
    'commands',
    '  config, lights, help, register, search',
    '',
    'options',
    '  -c, --config   location of the configuration file (defaults to ~/.hue.json)',
    '  -h, --help     print this message and exit',
    '  -H, --host     the hostname or ip of the bridge to control',
    '  -j, --json     force output to be in json',
    '  -u, --updates  check for available updates',
    '  -v, --version  print the version number and exit'
  ].join('\n');
}

// command line arguments
var options = [
  'c:(config)',
  'h(help)',
  'H:(host)',
  'j(json)',
  'u(updates)',
  'v(version)'
].join('');
var parser = new getopt.BasicParser(options, process.argv);

var option;
var json = false;
while ((option = parser.getopt()) !== undefined) {
  switch (option.option) {
    case 'c':
      if (statPath(option.optarg)) {
        configfile = option.optarg;
      } else {
        console.log('Specified config file could not be found.');
        process.exit(1);
      }
      break;
    case 'h': console.log(usage()); process.exit(0);
    case 'H': config.host = option.optarg; break;
    case 'j': json = true; break;
    case 'u': // check for updates
      require('latest').checkupdate(package, function(ret, msg) {
        console.log(msg);
        process.exit(ret);
      });
      return;
    case 'v': console.log(package.version); process.exit(0);
    default: console.error(usage()); process.exit(1); break;
  }
}
var args = process.argv.slice(parser.optind());

try {
  config = JSON.parse(fs.readFileSync(configfile, 'utf-8'));
} catch (e) {
  config = {host: null};
}

// load in config colors if present
if (config.colors) {
  Object.keys(config.colors).forEach(function(name) {
    csscolors[name] = config.colors[name];
  });
}

// command switch
var client, lights;
switch (args[0]) {
  case 'config': // get the config as json
    client = getclient();
    client.config(function(err, data) {
      console.log(JSON.stringify(err || data, null, 2));
    });
    break;
  case 'help': // print the help message
    console.log(usage());
    break;
  case 'lights': case 'light': case 'list':// mess with the lights
    client = getclient();
    getlights(client, function(lights) {
      // if there are no lights specified, return the list of lights
      var keys = Object.keys(lights);
      if (!args[1]) {
        if (json) return console.log(JSON.stringify(lights, null, 2));
        //printf('%4s %s', 'ID', 'NAME');
        keys.forEach(function(key) {
          printf('%4d %s', key, lights[key].name);
        });
        return;
      }

      // handle shortucts like `lights off`, `lights all on`
      var l = args[1].split(',');
      switch (l[0]) {
        case 'all': l = keys; break;
        case 'on': l = keys; args[2] = 'on'; break;
        case 'off': l = keys; args[2] = 'off'; break;
        case 'colorloop': l = keys; args[2] = 'colorloop'; break;
        case 'alert': l = keys; args[2] = 'alert'; break;
        case 'clear': l = keys; args[2] = 'clear'; break;
        case 'reset': l = keys; args[2] = 'reset'; break;
        case 'state': l = keys; args[2] = 'state'; break;
      }
      // if there is no action specified, return info for all lights
      if (!args[2]) {
        //if (!json) printf('%4s %-5s %s', 'ID', 'STATE', 'NAME');
        l.forEach(function(id) {
          client.light(id, function(err, data) {
            if (data) data.id = id;
            if (json) return console.log(JSON.stringify(err || data, null, 2));
            if (err) return printf('%4d %-5s %s (type %d)', id, 'error', err.description, err.type);

            printf('%4d %-5s %-7d %s',
                id,
                data.state.on ? 'on' : 'off',
                data.state.bri,
                data.name);
          });
        });
        return;
      }

      switch (args[2]) {
        case 'off': l.forEach(function(id) { client.off(id, callback(id)); }); break;
        case 'on': l.forEach(function(id) { client.on(id, callback(id)); }); break;
        case 'colorloop': l.forEach(function(id) { client.state(id, {effect: 'colorloop'}, callback(id)); }); break;
        case 'alert': l.forEach(function(id) { client.state(id, {alert: 'lselect'}, callback(id)); }); break;
        case 'clear': l.forEach(function(id) { client.state(id, {effect: 'none'}, callback(id)); }); break;
        case 'reset': l.forEach(function(id) { client.state(id, {on: true, bri: 250, sat: 120, hue: 14000, effect: 'none'}, callback(id)); }); break;
        case 'state': // read state from stdin
          var data = JSON.parse(fs.readFileSync('/dev/stdin', 'utf-8'));
          l.forEach(function(id) {
            client.state(id, data, callback(id));
          });
          break;
        default: // hex, colors, or brightness
          var s = args[2];

          if (s[0] === '-' || s[0] === '+' || s[0] === '=') {
            var num = +s.slice(1);
            l.forEach(function(id) {
              client.light(id, function(err, data) {
                if (err) {
                  if (json)
                    return console.log(JSON.stringify(err || data, null, 2));
                  return printf('%4d %-5s %s (type %d)', id, 'error', err.description, err.type);
                }
                var bri = data.state.bri;
                var oldbri = bri;
                switch (s[0]) {
                  case '=':
                    bri = num;
                    break;
                  case '+':
                    bri += num;
                    break;
                  case '-':
                    bri -= num;
                    break;
                }
                bri = Math.min(255, Math.max(0, bri));
                client.state(id, {bri: bri}, function(err, data) {
                  if (json) return console.log(JSON.stringify(err || data, null, 2));
                  if (err) return printf('%4d %-5s %s (type %d)', id, 'error', err.description, err.type);
                  console.log('light %d brightness %d -> %s', id, oldbri, bri);

                });
              });
            });
            return;
          }

          var hex = csscolors[s] || s;
          var rgb = hex2rgb(hex);

          l.forEach(function(id) {
            client.rgb(id, rgb[0], rgb[1], rgb[2], callback(id));
          });
          break;
      }

      function callback(id) {
        return function(err, data) {
          if (json) return console.log(JSON.stringify(err || data, null, 2));
          if (err) return console.error('light %d failed: %s', id, err.description);
          console.log('light %d success', id);
        }
      }
    });
    break;
  case 'register': // register this app
    // Check for existing config
    var existingconfig = statPath(configfile);
    if (existingconfig && existingconfig.isFile()) {  
        console.log('A config file already exists at %s', configfile);
        console.log('please remove it before attempting to register a new hub')
        process.exit(1);
    }
    // Attempt to pair with hue hub
    client = getclient();
    console.log('please go and press the link button on your base station');
    client.register(function(err, resp) {
      if (err) {
        console.error('failed to pair to Hue Base Station %s', config.host);
        throw err;
      }
      
      console.log('Hue Base Station paired!')
      console.log('username: ' + resp[0].success.username);
      config.username = resp[0].success.username;
      
      // writing config file
      var s = JSON.stringify(config, null, 2);
      fs.writeFileSync(configfile, s + '\n');
      console.log('config file written to `%s`', configfile);
    });
    break;
  case 'search': // search for base stations
    Hue.discover(function(stations) {
      if (json) return console.log(JSON.stringify(stations, null, 2));
      console.log('%d stations found\n', stations.length);
      stations.forEach(function(name, i) { console.log('%d: %s', i+1, name); });
    });
    break;
  case 'rename': // rename light
    client = getclient();
    client.rename(args[1], args[2], function(reply) {
      if (reply) {
        console.log('problem renaming light: ' + reply.description);
      } else {
        console.log('light %d renamed', args[1]);
      }
    });
    break;
  default: // uh oh
    console.error('unknown command: run `hue help` for more information');
    process.exit(1);
}

// wrapper around get client to error on failure
function getclient() {
  if (!config.host) {
    console.error([
      'error: host not set',
      '',
      'search for hosts with `hue search`',
      'then run with `-H <host>`',
    ].join('\n'));
    process.exit(1);
  }

  // create the client
  var client = Hue.createClient({
    stationIp: config.host,
    appName: app,
    username: config.username
  });
  return client;
}

// wrapper around get lights to error on failure
function getlights(client, cb) {
  // checking for lights will also help us ensure the app is registered
  // from exmample here https://github.com/thatguydan/hue.js
  client.lights(function(err, lights) {
    if (err && err.type === 1) {
      console.error('error: application not registered, run `hue register` first');
      process.exit(1);
    }
    if (err) throw err;
    cb(lights)
  });
}

// convert a 3 or 6 character hex string to rgb
function hex2rgb(hex) {
  if (hex[0] === '#') hex = hex.slice(1);
  var r, g, b;

  if (hex.length === 3) {
    r = todec(hex[0], hex[0]);
    g = todec(hex[1], hex[1]);
    b = todec(hex[2], hex[2]);
  } else {
    r = todec(hex[0], hex[1]);
    g = todec(hex[2], hex[3]);
    b = todec(hex[4], hex[5]);
  }

  return [r, g, b];

  function todec(h, i) {
    return parseInt(h + '' + i, 16)
  }
}

function statPath(path) {
  try {
    return fs.statSync(path);
  } catch (ex) {}
  return false;
}
