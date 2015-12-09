// show the bridge config

var yaml = require('yamljs');

module.exports = config;

function config(subcmd, opts, args, cb) {
  if (opts.help) {
    this.do_help('help', {}, [subcmd], cb);
    return;
  }

  this.client.config(function(err, data) {
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

config.options = [
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

config.help = 'show the hue bridge config';
