// show the scenes

var tabula = require('tabula');

var common = require('../common');

module.exports = scenes;

// columns default without -o
var columnsDefault = 'id,name,active,lights';

// sort default with -s
var sortDefault = 'id';

function scenes(subcmd, opts, args, cb) {
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

  this.client.scenes(function(err, data) {
    if (err) {
      cb(err);
      return;
    }

    if (opts.json) {
      console.log(JSON.stringify(data, null, 2));
      cb();
      return;
    }

    // convert scenes data into array
    var d = [];
    Object.keys(data).forEach(function (id) {
      data[id].id = id;
      data[id].lights = (data[id].lights || []).join(',');
      d.push(data[id]);
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

scenes.options = [
  {
    names: ['help', 'h'],
    type: 'bool',
    help: 'Show this help.'
  }
].concat(common.getCliTableOptions({
  sortDefault: sortDefault
}));

scenes.help = 'show the hue scenes\n{{options}}';
