class GameScene {
  constructor(name, game){
    this.gameObjects = [];
    this.staticGameObjects = [];
    this.game = game;
    this._toBeDestroyed = [];
    this.name = name;
  }

  awake(){}
  update(){}
  render(){}
  onTransitionTo(){}
  onTransitionFrom(){}

  instantiate(gameObject, isStatic, constructArgs = [], parent){
    const obj = new gameObject(...constructArgs, this.game, this, parent);
    if(isStatic){
      this.staticGameObjects.push(obj);
      obj.awake();
    } else {
      this.gameObjects.push(obj);
      obj.awake();
    }
    return obj;
  }

  destroy(obj){
    obj.onDestroy();
    this._queueDestroy(obj)
  }

  _queueDestroy(obj){
    this._toBeDestroyed.push(obj);
  };

  _destroyQueue(){
    _.each(this._toBeDestroyed, (obj) => {
      _.remove(this.gameObjects, obj);
      _.remove(this.staticGameObjects, obj);
    })
    this._toBeDestroyed = [];
  }

}
