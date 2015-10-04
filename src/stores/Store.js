import util from '../util'

export default function Store(opts, init){

  riot.observable(this)

  util.extend(this, opts)

  this.emitChange = () => {
    // Was getting problems with views responding to Store change events before
    // all the stores had got to handle the action. This ensures all change
    // events are queued up at the end, after the Stores have all had their turn
    // dealing with the action.
    setTimeout(() => this.trigger('change'),0)
  }

  if(typeof init == "function")
    init.call(this)
}
