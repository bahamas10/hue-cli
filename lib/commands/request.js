// raw request

var fs = require('fs');

module.exports = request;

function request(subcmd, opts, args, cb) {
  if (opts.help) {
    this.do_help('help', {}, [subcmd], cb);
    return;
  }

  var o = {
    method: opts.method,
    path: args[0]
  };

  if (opts.stdin) {
    o.data = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
    this.debug(o.data);
  }

  this.client.request(o, function(err, data) {
    if (err) {
      cb(err);
      return;
    }

    console.log(JSON.stringify(data, null, 2));
    cb();
  });
}

request.options = [
  {
    names: ['help', 'h'],
    type: 'bool',
    help: 'Show this help.'
  },
  {
    names: ['method', 'X'],
    type: 'string',
    help: 'Show this help.',
    default: 'GET',
    helpArg: 'METHOD'
  },
  {
    names: ['stdin'],
    type: 'bool',
    help: 'Read body data over stdin.'
  }
];

request.help = 'raw request\n{{options}}';
