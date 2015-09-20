var RiotControl = {
  _stores: {},
  _global: riot.observable({}),
  _namespace_delimeter: '_',
  addStore: function(namespace, store) {
    this._stores[namespace] = store;
  }
};

['on','one','off','trigger'].forEach(function(api){
  RiotControl[api] = function() {
    var args = [].slice.call(arguments);
    var unsplit = args[0].split(this._namespace_delimeter)
    try{
      this._stores[unsplit[0]][api].apply(null, args)
    }catch(e){
      this._global[api].apply(null, args)
    }
  };
});

if (typeof(module) !== 'undefined') module.exports = RiotControl;
