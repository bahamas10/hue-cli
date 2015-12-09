// search for bridges

var hue = require('hue-sdk');
var tabula = require('tabula');

var common = require('../common');

module.exports = discover;

// columns default without -o
var columnsDefault = 'ip';

// sort default with -s
var sortDefault = 'id';

function discover(subcmd, opts, args, cb) {
  if (opts.help) {
    this.do_help('help', {}, [subcmd], cb);
    return;
  }

  var columns = columnsDefault;
  if (opts.o)
    columns = opts.o;
  columns = columns.split(',');

  var sort = opts.s.split(',');

  var listOpts;
  try {
    listOpts = common.kvToObj(args);
  } catch (e) {
    cb(e);
    return;
  }

  hue.discover(function(err, data) {
    if (err) {
      cb(err);
      return;
    }

    if (opts.json) {
      console.log(JSON.stringify(data, null, 2));
      cb();
      return;
    }

    var d = data.map(function (ip) {
      return {ip: ip};
    });

    // filter based on listOpts
    var d = common.filterArrayByKv(d, listOpts);

    // print the data
    tabula(d, {
      skipHeader: opts.H,
      columns: columns,
      sort: sort
    });

    cb();
  });
}

discover.options = [
  {
    names: ['help', 'h'],
    type: 'bool',
    help: 'Show this help.'
  }
].concat(common.getCliTableOptions({
  sortDefault: sortDefault
}));

discover.help = 'search for hue bridges\n{{options}}';

discover.aliases = ['search'];
