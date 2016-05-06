/**
 * Hue Command Line Interface
 *
 * Author: Dave Eddy <dave@daveeddy.com>
 * Date: November 27, 2015
 * License: MIT
 */

var fs = require('fs');
var path = require('path');
var util = require('util');

var cmdln = require('cmdln');
var csscolors = require('css-color-names');
var hue = require('hue-sdk');
var tabula = require('tabula');

var package = require('../package.json');

var HOME_DIR = process.env.HOME ||
               process.env.HOMEPATH ||
               process.env.USERPROFILE;

// define the CLI object which includes base level options
function CLI() {
  cmdln.Cmdln.call(this, {
    name: 'hue',
    desc: package.description,
    options: [
      {
        names: ['config', 'c'],
        type: 'string',
        help: 'config file - defaults to ~/.hue-cli.json',
        helpArg: 'CONFIG'
      },
      {
        names: ['debug', 'd'],
        type: 'bool',
        help: 'enable debug logging'
      },
      {
        names: ['host', 'H'],
        type: 'string',
        help: 'host address of the hue bridge',
        helpArg: 'HOST'
      },
      {
        names: ['help', 'h'],
        type: 'bool',
        help: 'print this help message and exit'
      },
      {
        names: ['user', 'U'],
        type: 'string',
        help: 'username associated with the hue bridge',
        helpArg: 'USER'
      },
      {
        names: ['updates', 'u'],
        type: 'bool',
        help: 'check npm for available updates'
      },
      {
        names: ['version', 'v'],
        type: 'bool',
        help: 'print the version number and exit'
      },
    ],
    helpSubcmds: [
      { group: 'Setup' },
      'register',
      'discover',
      { group: 'Lights' },
      'lights',
      'light',
      { group: 'Groups' },
      'groups',
      'group',
      { group: 'Schedules' },
      'schedules',
      'schedule',
      { group: 'Scenes' },
      'scenes',
      { group: 'Sensors' },
      'sensors',
      { group: 'Rules' },
      'rules',
      { group: 'Users' },
      'users',
      { group: 'Other Commands' },
      'config',
      'full-state',
      'request',
      { group: 'Generic Commands' },
      //'completion',
      'help'
    ],
  });
}
util.inherits(CLI, cmdln.Cmdln);

// called when the arguments are parsed
CLI.prototype.init = function init(opts, args, cb) {
  var self = this;

  // logging function to use for debug messages
  self.debug = function debug() {
    if (opts.debug) {
      var s = util.format.apply(util, arguments);
      return console.error('> %s', s);
    }
  };

  // -v, --version
  if (opts.version) {
    console.log(package.version);
    cb(false);
    return;
  }

  // -u, --updates
  if (opts.updates) {
    require('latest').checkupdate(package, function(ret, msg) {
      console.log(msg);
      process.exit(ret);
    });
    return;
  }

  // -c, --config
  var file = opts.config || path.join(HOME_DIR, '.hue-cli.json');
  var c = {};
  try {
    self.debug('loading config file: %s', file);
    c = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    self.debug('error reading config: %s', e.message);
    // throw this error if the config file was manually set
    if (opts.config)
      throw e;
  }
  if (c.host && !opts.host)
    opts.host = c.host;
  if (c.user && !opts.user)
    opts.user = c.user;

  // load in config colors if present
  if (c.colors) {
    Object.keys(c.colors).forEach(function(name) {
      csscolors[name] = c.colors[name];
    });
  }

  self.__defineGetter__('host', function () {
    if (self._host === undefined) {
      if (!opts.host) {
        console.error('host must be specified as "host" in a config or passed in with `-H host`');
        process.exit(1);
      }
      self._host = opts.host;
    }
    return self._host;
  });

  self.__defineGetter__('user', function () {
    if (self._user === undefined) {
      if (!opts.user) {
        console.error('user must be specified as "user" in a config or passed in with `-U user`');
        process.exit(1);
      }
      self._user = opts.user;
    }
    return self._user;
  });

  // Hue API client
  self.__defineGetter__('client', function () {
    if (self._client === undefined) {
      self.debug('instantiating client: %s@%s', self.user, self.host);
      self._client = new hue.Hue({
        host: self.host,
        user: self.user
      });
    }
    return self._client;
  });

  // Cmdln class handles `opts.help`.
  cmdln.Cmdln.prototype.init.apply(this, arguments);
};

// sub commands
CLI.prototype.do_register = require('./commands/register');
CLI.prototype.do_discover = require('./commands/discover');

CLI.prototype.do_lights = require('./commands/lights');
CLI.prototype.do_light = require('./commands/light');

CLI.prototype.do_groups = require('./commands/groups');
CLI.prototype.do_group = require('./commands/group');

CLI.prototype.do_schedules = require('./commands/schedules');
CLI.prototype.do_schedule = require('./commands/schedule');

CLI.prototype.do_scenes = require('./commands/scenes');

CLI.prototype.do_sensors = require('./commands/sensors');

CLI.prototype.do_rules = require('./commands/rules');

CLI.prototype.do_users = require('./commands/users');

CLI.prototype.do_config = require('./commands/config');
CLI.prototype.do_full_state = require('./commands/full-state');
CLI.prototype.do_request = require('./commands/request');

CLI.prototype.do_completion = require('./commands/completion');

// start the program
var cli = new CLI();
cli.main(process.argv, function (err, sbcmd) {
  if (err) {
    console.error('error: %s', err);
    process.exit(1);
  }

  process.exit(0);
});
