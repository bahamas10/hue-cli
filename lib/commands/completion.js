// bash completion

module.exports = completion;

function completion(subcmd, opts, args, cb) {
  if (opts.help) {
    this.do_help('help', {}, [subcmd], cb);
    return;
  }

  console.log(this.bashCompletion());
  cb();
}

completion.options = [
  {
    names: ['help', 'h'],
    type: 'bool',
    help: 'Show this help.'
  }
];

completion.help = 'output bash completion code';
completion.hidden = true;
