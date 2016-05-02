// show the schedule

var yaml = require('yamljs');

var common = require('../common');

module.exports = schedule;

function schedule(subcmd, opts, args, cb) {
  if (opts.help) {
    this.do_help('help', {}, [subcmd], cb);
    return;
  }
  var data;

  if (opts.delete !== undefined) {
    this.client.deleteSchedule(opts.delete, finish);
    return;
  } else if (opts.modify !== undefined) {
    data = safeKVParse(args);
    this.client.modifySchedule(opts.modify, data, finish);
    return;
  } else if (opts.create) {
    data = safeKVParse(args);
    this.client.createSchedule(data, finish);
    return;
  }

  var id = args.shift();

  if (!id) {
    cb(new Error('first argument must be supplied'));
    return;
  }

  this.client.schedule(id, finish);

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

schedule.options = [
  {
    names: ['help', 'h'],
    type: 'bool',
    help: 'Show this help.'
  },
  {
    names: ['json', 'j'],
    type: 'bool',
    help: 'JSON output.'
  },
  {
    names: ['create'],
    type: 'bool',
    help: 'Create a schedule.'
  },
  {
    names: ['modify'],
    type: 'positiveInteger',
    helpArg: 'ID',
    help: 'Modify a schedule.'
  },
  {
    names: ['delete'],
    type: 'positiveInteger',
    helpArg: 'ID',
    help: 'Delete a schedule.'
  }
];
schedule.help = 'show the hue schedule\n{{options}}';
