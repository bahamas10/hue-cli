// show the rules

var tabula = require('tabula');

var common = require('../common');

module.exports = rules;

// columns default without -o
var columnsDefault = 'id,name,status,creation';

// sort default with -s
var sortDefault = 'id';

function rules(subcmd, opts, args, cb) {
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

  this.client.rules(function(err, data) {
    if (err) {
      cb(err);
      return;
    }

    if (opts.json) {
      console.log(JSON.stringify(data, null, 2));
      cb();
      return;
    }

    // convert rules data into array
    var d = [];
    Object.keys(data).forEach(function (id) {
      var o = data[id];
      o.id = id;
      o.creation = common.human(new Date(o.created));
      d.push(o);
    });

    // filter based on listOpts
    d = common.filterArrayByKv(d, listOpts);

    // print the data
    tabula(d, {
      skipHeader: opts.H,
      columns: columns,
      sort: sort
    });

    cb();
  });
}

rules.options = [
  {
    names: ['help', 'h'],
    type: 'bool',
    help: 'Show this help.'
  }
].concat(common.getCliTableOptions({
  sortDefault: sortDefault
}));

rules.help = 'show the hue rules\n{{options}}';
