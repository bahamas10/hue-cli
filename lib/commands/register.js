// register a user

var util = require('util');

var hue = require('hue-sdk');
var yaml = require('yamljs');

var package = require('../../package.json');

module.exports = register;

function register(subcmd, opts, args, cb) {
  if (opts.help) {
    this.do_help('help', {}, [subcmd], cb);
    return;
  }

  var user = args[0];

  if (!user) {
    cb(new Error('username must be supplied as the first operand'));
    return;
  }

  var name = util.format('%s#%s', package.name, user);
  console.log('sending request... press the link button on the hue bridge');
  hue.createUser(this.host, name, function (err, data) {
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

register.options = [
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

register.help = 'register a new user\n{{options}}';
