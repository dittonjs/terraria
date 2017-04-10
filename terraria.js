const dataStore = {
  worldNames: [],
  liveGames: [],
};


class MainWorld extends GameScene {
  constructor(...args){
    super(...args);
    this.camera = null;
    this.player = null;
  }

  handleDestory(serverObj){
    // if(serverObj.creatorId != this.game.network.playerId){
      console.log(serverObj.name + ' DESTROYED');
      this.game.addServerUpdate((elapsedTime) => {
        let otherObj = _.find(this.gameObjects, obj => obj.serverId == serverObj.serverId);
        if(!otherObj){
          otherObj = _.find(this.staticGameObjects, obj => obj.serverId == serverObj.serverId);
        }
        // because the server is the creator sometimes at which point the object will already be deleted by the client
        otherObj && this.destroy(otherObj);
      });
    // }
  }

  handleUpdate(serverObj){
    if(serverObj.creatorId != this.game.network.playerId){
      this.game.addServerUpdate((elapsedTime) => {
        const otherObject = _.find(this.gameObjects, obj => obj.serverId == serverObj.serverId);
        _.merge(otherObject, serverObj);
      });
    }
  }
  awake(){
    this.camera = this.instantiate(DebugCamera, false);
    this.game.network.on('player updated', (player) => {this.handleUpdate(player)});
    this.game.network.on('player joined', (player) => {
      if(player.creatorId != this.game.network.playerId){
        this.game.addServerUpdate((elapsedTime) => {
          const p = this.instantiate(Player, false);
          _.merge(p, player);
          p.setConditionMap({
            idle: ()=>(true),
            walk: ()=>(p.conditions.walk),
            run: ()=>(p.conditions.run),
            jump: ()=>(p.conditions.jump),
          });
        });
      }
    });

    this.game.network.on('laser instantiated', (obj) => {
      if(obj.creatorId != this.game.network.playerId){
        const laser = this.instantiate(Laser, false, [{}]);
        _.merge(laser, obj);
      } else {
        const myLaser = _.find(this.gameObjects, (gObj)=>{
          return gObj.name == 'laser';
        });
        if(!myLaser) return;
        myLaser.serverId = obj.serverId;
        myLaser.creatorId = obj.creatorId;
      }
    });

    this.game.network.on('block instantiated', (block)=>{
      if(block.creatorId != this.game.network.playerId){
        const bl = this.instantiate(BLOCKS[block.type], true, [{}]);
        _.merge(bl, block);
      } else {
        const myBlock = _.find(this.staticGameObjects, (bl)=>{
          return bl.transform.x == block.transform.x && bl.transform.y == block.transform.y;
        });
        myBlock.serverId  = block.serverId;
        myBlock.creatorId = block.creatorId;
      }
    });

    this.game.network.on('laser destroyed', (obj)=>{
      this.handleDestory(obj);
    });
    this.game.network.on('block destroyed', (obj)=>{
      this.handleDestory(obj);
    });

    this.game.network.on('laser updated', (obj) => {this.handleUpdate(obj)});
    window.scene = this;
  }

  castRay(from, to, caster){
    const rise = to.y - from.y;
    const run = to.x - from.x;
    const mod = rise / run;
    const left = to.x < from.x;
    const down = to.y > from.y;
    const allGameObjects = [...this.staticGameObjects, ...this.gameObjects];
    const collisions = [];
    for(let i = 0; i < allGameObjects.length; i++){
      const obj = allGameObjects[i];
      if(left && obj.transform.x > from.x) continue;
      if(!left && obj.transform.x < from.x) continue;
      if(down && obj.transform.y < from.y) continue;
      if(!down && obj.transform.y > from.y) continue;
      if(obj.name == 'block'){
        if(left){
          const y = (((obj.transform.x + (obj.width / 2)) - from.x)*mod) + from.y;
          if(y < obj.transform.y + (obj.height/2) && y > obj.transform.y - (obj.height/2)){
            console.log('right wall',mod, y, obj.transform.x + (obj.width / 2))
            obj.transform.x < from.x && obj.transform.x > to.x && collisions.push({
              x: obj.transform.x + (obj.width / 2),
              y,
              obj
            });
          }
        } else {
          const y = (((obj.transform.x - (obj.width / 2)) - from.x)*mod) + from.y;
          if(y < obj.transform.y + (obj.height/2) && y > obj.transform.y - (obj.height/2)){
            console.log('left wall',mod, y, obj.transform.x + (obj.width / 2))
            obj.transform.x > from.x && obj.transform.x < to.x && collisions.push({
              x: obj.transform.x - (obj.width / 2),
              y,
              obj
            });
          }
        }
        if(down){
          const y = obj.transform.y - (obj.height/2);
          const b = from.y;
          let x = (y - b)/mod;
          x = x + from.x
          if(x < obj.transform.x + (obj.width/2) && x > obj.transform.x - (obj.width/2)){
            console.log('top wall', mod, x, y)
            y > from.y && y < to.y && collisions.push({
              x,
              y,
              obj
            });
          }
        } else {
          const y = obj.transform.y + (obj.height/2);
          const b = from.y;
          let x = (y - b)/mod;
          x = x + from.x
          if(x < obj.transform.x + (obj.width/2) && x > obj.transform.x - (obj.width/2)){
            console.log('bottom wall', mod, x, y)
            y < from.y && y > to.y && collisions.push({
              x,
              y,
              obj
            });
          }
        }
      }
    }
    const d = (point)=>{
      return Math.pow(point.x - from.x, 2) + Math.pow(point.y - from.y, 2);
    }
    if(collisions.length == 0) return null;
    // http://stackoverflow.com/questions/24791010/how-to-find-the-coordinate-that-is-closest-to-the-point-of-origin
    return _.reduce(collisions, (min, p)=>{
      if(d(p) < min.d) min.point = p;
      return min;
    }, {point: collisions[0], d: d(collisions[0])}).point;
  }
}

function startGame(){
  const canvas = document.getElementById('main-canvas');
  canvas.width = 700;
  canvas.height = 500;
  const assets = [
    {type: 'image', src: '/spritesheets/sprites.png', name: 'sprites'},
    {type: 'image', src: '/spritesheets/character.png', name: 'player'}
  ];
  const game = new Game(canvas, assets);
  const mainWorld = new MainWorld('mainWorld', game);
  const splashScreen = new SplashScreen('splashScreen', game);
  const mainMenu = new MainMenu('mainMenu', game);
  const loadingScene = new LoadingScene('loadingScene', game);
  // mainMenu.awake();
  // mainWorld.awake();
  splashScreen.awake();
  game.addScene(splashScreen);
  game.addScene(mainMenu);
  game.addScene(loadingScene);
  game.addScene(mainWorld);
  game.start();
  return game;
};

(function(){
  let game = startGame();
})();
