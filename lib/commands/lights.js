// show the lights

var tabula = require('tabula');

var common = require('../common');

module.exports = lights;

// columns default without -o
var columnsDefault = 'id,name,status,brightness';

// columns default with -l
var columnsDefaultLong = 'uniqueid,id,name,status,brightness,type,modelid,swversion';

// sort default with -s
var sortDefault = 'id';

function lights(subcmd, opts, args, cb) {
  if (opts.help) {
    this.do_help('help', {}, [subcmd], cb);
    return;
  }

  var columns = columnsDefault;
  if (opts.o) {
    columns = opts.o;
  } else if (opts.long) {
    columns = columnsDefaultLong;
  }
  columns = columns.split(',');

  var sort = opts.s.split(',');

  var listOpts;
  try {
    listOpts = common.kvToObj(args);
  } catch (e) {
    cb(e);
    return;
  }

  this.client.lights(function(err, data) {
    if (err) {
      cb(err);
      return;
    }

    if (opts.json) {
      console.log(JSON.stringify(data, null, 2));
      cb();
      return;
    }

    // convert lights data into array
    var d = [];
    Object.keys(data).forEach(function (id) {
      var o = data[id];
      o.id = id;
      o.status = o.state.on ? 'on' : 'off';
      o.brightness = o.state.bri;
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

lights.options = [
  {
    names: ['help', 'h'],
    type: 'bool',
    help: 'Show this help.'
  }
].concat(common.getCliTableOptions({
  includeLong: true,
  sortDefault: sortDefault
}));

lights.help = 'show the hue lights\n{{options}}';
