// show the group

var assert = require('assert');

var yaml = require('yamljs');

var common = require('../common');

module.exports = group;

function group(subcmd, opts, args, cb) {
  if (opts.help) {
    this.do_help('help', {}, [subcmd], cb);
    return;
  }
  var data;

  var command = args.shift();

  var id = parseInt(command, 10);
  if (!isNaN(id)) {
    command = 'get';
  } else {
    id = parseInt(args.shift(), 10);
  }

  if (isNaN(id)) {
    cb(new Error('`id` argument must be a number'));
    return;
  }

  switch (command) {
    case 'delete':
      this.client.deleteGroup(id, finish);
      return;
    case 'modify':
      data = safeKVParse(args);
      if (data.lights)
        data.lights = data.lights.split(',');
      this.client.modifyGroup(opts.modify, data, finish);
      return;
    case 'create':
      data = safeKVParse(args);
      if (data.lights)
        data.lights = data.lights.split(',');
      this.client.createGroup(data, finish);
      return;
  }

  // figure out what the user wants
  var state = args.shift();

  // get group information only
  if (state === undefined) {
    this.client.group(id, finish);
    return;
  }

  // create a light state object
  state = common.createLightState(command, args);
  if (state instanceof Error) {
    cb(state);
    return;
  }
  this.debug('state = %s', JSON.stringify(state));

  this.client.setGroupState(id, state, finish);

  function safeKVParse(args) {
    try {
      return common.kvToObj(args);
    } catch (e) {
      cb(e);
    }
  }

  function finish(err, result) {
    if (err) {
      cb(err);
      return;
    }

    var s;
    if (opts.json)
      s = JSON.stringify(result, null, 2);
    else
      s = yaml.stringify(result);

    console.log(s);

    cb();
  }
}

group.options = [
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
group.help = 'show the hue group\n{{options}}';
