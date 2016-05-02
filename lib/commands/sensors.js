// show the sensors

var tabula = require('tabula');

var common = require('../common');

module.exports = sensors;

// columns default without -o
var columnsDefault = 'id,name,type,modelid,manufacturername,swversion';

// sort default with -s
var sortDefault = 'id';

function sensors(subcmd, opts, args, cb) {
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

  this.client.sensors(function(err, data) {
    if (err) {
      cb(err);
      return;
    }

    if (opts.json) {
      console.log(JSON.stringify(data, null, 2));
      cb();
      return;
    }

    // convert sensors data into array
    var d = [];
    Object.keys(data).forEach(function (id) {
      data[id].id = id;
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

sensors.options = [
  {
    names: ['help', 'h'],
    type: 'bool',
    help: 'Show this help.'
  }
].concat(common.getCliTableOptions({
  sortDefault: sortDefault
}));

sensors.help = 'show the hue sensors\n{{options}}';
