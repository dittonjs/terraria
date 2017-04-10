function multiple(parents){
  let GameObjectWithMixin = class extends GameObject{
    constructor(...args){
      super(...args);
    }
  };
  _.each(parents, (className)=>{
    _.each(Object.getOwnPropertyNames(className.prototype), (name)=>{
      if(name != "constructor"){
        GameObjectWithMixin.prototype[name] = className.prototype[name];
      }
    });
  });
  return GameObjectWithMixin;
}
