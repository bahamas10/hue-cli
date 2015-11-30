// show the group

var yaml = require('yamljs');

module.exports = group;

function group(subcmd, opts, args, cb) {
  if (opts.help) {
    this.do_help('help', {}, [subcmd], cb);
    return;
  }

  var id = parseInt(args.shift(), 10);

  if (isNaN(id)) {
    cb(new Error('first argument must be a number'));
    return;
  }

  this.client.group(id, function(err, data) {
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
