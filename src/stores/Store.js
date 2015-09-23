function Store(opts, init){

  riot.observable(this)

  util.extend(this, opts)

  if(typeof init == "function")
    init.call(this)

  this.emitChange = () => {
    this.trigger('change')
  }
}
