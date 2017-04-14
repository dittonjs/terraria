class Game {
  constructor(canvas, assets, networkData){
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.context = canvas.getContext('2d');
    this.graphics = new JdCanvasApi(this.context);
    this.pendingInput = [];
    this.readyInput = [];
    this.elapsedTime = 0;
    this.math = new JMath();
    this.input = new GameInput();
    this.shouldContinue = true;
    this.gameLoop = this.gameLoop.bind(this);
    this.menuInput = this.menuInput.bind(this);
    this.onCanvasClick = this.onCanvasClick.bind(this);
    this.resetTimestamp = true;
    this.scenes = [];
    this.serverUpdates = [];
    this.currentScene = 0;
    this.nextScene = null;
    this.network = new GameNetwork(networkData);
    this.assets = {};
    this.assetsLoaded = 0;
    this.assetsReady = false;
    this.playerIds = [];
    this.loadAssets(assets);
    window.addEventListener('keydown', this.menuInput);
    canvas.addEventListener('click', this.onCanvasClick)
  }

  loadAssets(assets){
    _.each(assets, (asset) => {
      if(asset.type == 'image'){
        const img = new Image();
        img.addEventListener('load', ()=>{
          this.assetsLoaded += 1;
          if(this.assetsLoaded == assets.length){
            this.assetsReady = true;
          }
        }, false);
        img.src = asset.src;
        this.assets[asset.name] = img;
      }
    });
  }

  awake(){
    this.start();
  }

  start(){
    requestAnimationFrame(this.gameLoop);
  }

  stop(){
    this.shouldContinue = false;
  }

  addScene(scene){
    // scene.awake()
    this.scenes.push(scene);
  }

  changeScene(scene){
    console.log("change scene", scene);
    this.nextScene = scene;
    this.scenes[this.nextScene].awake();
  }

  gameLoop(timestamp) {
    if(this.resetTimestamp){
      this.elapsedTime = timestamp;
      this.resetTimestamp = false;
      requestAnimationFrame(this.gameLoop);
      return;
    }
    const timeSinceLastUpdate = timestamp - this.elapsedTime;
    this.elapsedTime = timestamp;

    if(this.nextScene != null){
      this.scenes[this.currentScene].onTransitionFrom(this.nextScene);
      this.scenes[this.nextScene].onTransitionTo(this.currentScene);
      this.currentScene = this.nextScene;
      this.nextScene = null;
    }

    this.getInput();
    this.update(timeSinceLastUpdate);
    this.render();
    this.clearInput();
    this.shouldContinue && requestAnimationFrame(this.gameLoop);
  }

  getInput(){
    this.readyInput = [...this.pendingInput];
    this.pendingInput = [];
  }
  _clickToWorldSpace(e){
    let x = e.clientX - e.target.offsetLeft;
    this.scenes[this.currentScene].camera && (x += this.scenes[this.currentScene].camera.transform.x);
    let y = e.clientY - e.target.offsetTop;
    this.scenes[this.currentScene].camera && (y += this.scenes[this.currentScene].camera.transform.y);
    return new Transform(x, y);
  }
  _clickToScreenSpace(e){
    let x = e.clientX - e.target.offsetLeft;
    let y = e.clientY - e.target.offsetTop;
    return new Transform(x, y);
  }
  onCanvasClick(e){
    e.preventDefault();
    const transform = this._clickToWorldSpace(e);
    const screenSpace = this._clickToScreenSpace(e);
    this.pendingInput.push({key: 'click', transform, screenSpace});
  }
  menuInput(e){
    e.preventDefault();

    switch (e.keyCode) {
      case 38:
      case 87:
      case 73:
        this.pendingInput.push({key: 'up'});
        break;
      case 40:
      case 83:
      case 75:
        this.pendingInput.push({key: 'down'});
        break;
      case 37:
      case 65:
      case 74:
        this.pendingInput.push({key: 'left'});
        break;
      case 39:
      case 68:
      case 76:
        this.pendingInput.push({key: 'right'});
        break;
      case 13:
        this.pendingInput.push({key: 'confirm'});
        break;
      case 27:
        this.pendingInput.push({key: 'escape'});
        break;
      case 9:
        this.pendingInput.push({key: 'tab'});
        break;
      default:
        break;
    }
  }

  checkCollisions(){
    _.each(this.scenes[this.currentScene].gameObjects, (obj)=>{
      _.each(this.scenes[this.currentScene].gameObjects, (other)=>{
        obj._checkCollision && other._checkCollision && obj._checkCollision(other);
      });
      _.each(this.scenes[this.currentScene].staticGameObjects, (other)=>{
        obj._checkCollision && other._checkCollision && obj._checkCollision(other);
      });
    });
  }

  update(timeSinceLastUpdate){
    if(this.scenes[this.currentScene]){
      _.each(this.serverUpdates, update => update(timeSinceLastUpdate));
      this.scenes[this.currentScene].update(timeSinceLastUpdate);
      this.checkCollisions();
      // !this.scenes[this.currentScene].assetsReady === false &&
        _.each(this.scenes[this.currentScene].gameObjects, gameObject => gameObject.update(timeSinceLastUpdate));
      this.scenes[this.currentScene]._destroyQueue();
      this.serverUpdates = [];
    }
  }
  addServerUpdate(callback){
    this.serverUpdates.push(callback);
  }
  render(){
    if(this.scenes[this.currentScene]){
      this.clearForRerender();
      this.scenes[this.currentScene].render();
      // !this.scenes[this.currentScene].assetsReady === false &&
        _.each(this.scenes[this.currentScene].staticGameObjects, gameObject => gameObject.render(this.context));
      // !this.scenes[this.currentScene].assetsReady === false &&
        _.each(this.scenes[this.currentScene].gameObjects, gameObject => gameObject.render(this.context));
    }
  }

  clearForRerender(){
    this.context.save();
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.restore();
  }

  clearInput(){
    this.readyInput = [];
  }
}
