// show the users

var tabula = require('tabula');

var common = require('../common');

module.exports = users;

// columns default without -o
var columnsDefault = 'id,name,creation,lastuse';

// sort default with -s
var sortDefault = 'id';

function users(subcmd, opts, args, cb) {
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

  this.client.config(function(err, data) {
    if (err) {
      cb(err);
      return;
    }

    data = data.whitelist;

    if (opts.json) {
      console.log(JSON.stringify(data, null, 2));
      cb();
      return;
    }

    // convert users data into array
    var d = [];
    Object.keys(data).forEach(function (id) {
      var o = {};
      o.id = id;
      o.name = data[id].name;

      var creation = new Date(data[id]['create date']);
      o.creation = common.human(creation);

      var lastuse = new Date(data[id]['last use date']);
      o.lastuse = common.human(lastuse);

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

users.options = [
  {
    names: ['help', 'h'],
    type: 'bool',
    help: 'Show this help.'
  }
].concat(common.getCliTableOptions({
  sortDefault: sortDefault
}));

users.help = 'show the hue users\n{{options}}';
