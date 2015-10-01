var util = {
  extend (object, properties){
      for(prop in properties){
        if(properties.hasOwnProperty(prop)){
          object[prop] = properties[prop]
        }
      }
  },
  bound (x, min, max) {
    return Math.min(Math.max(x, min), max)
  }
}
