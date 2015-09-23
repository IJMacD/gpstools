function Store(opts, init){

  riot.observable(this)

  util.extend(this, opts)

  this.emitChange = () => {
    this.trigger('change')
  }

  if(typeof init == "function")
    init.call(this)
}
