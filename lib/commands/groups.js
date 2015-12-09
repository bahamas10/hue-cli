// show the groups

var tabula = require('tabula');

var common = require('../common');

module.exports = groups;

// columns default without -o
var columnsDefault = 'id,name,type,lights';

// sort default with -s
var sortDefault = 'id';

function groups(subcmd, opts, args, cb) {
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

  this.client.groups(function(err, data) {
    if (err) {
      cb(err);
      return;
    }

    if (opts.json) {
      console.log(JSON.stringify(data, null, 2));
      cb();
      return;
    }

    // convert groups data into array
    var d = [];
    Object.keys(data).forEach(function (id) {
      var o = data[id];
      d.push({
        id: id,
        name: o.name,
        type: o.type,
        lights: o.lights.join(','),
      });
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

groups.options = [
  {
    names: ['help', 'h'],
    type: 'bool',
    help: 'Show this help.'
  }
].concat(common.getCliTableOptions({
  sortDefault: sortDefault
}));

groups.help = 'show the hue groups\n{{options}}';
