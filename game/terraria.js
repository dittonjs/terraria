const dataStore = {
  worldNames: [],
  liveGames: [],
};


class MainWorld extends GameScene {
  constructor(...args){
    super(...args);
    this.camera = null;
    this.player = null;
    this.camera = this.instantiate(DebugCamera, false);
    this.instantiate(BackgroundRenderer, true);
    this.times = [10000, 60000, 60000, 60000, 60000, 60000, 30000, 10000, 10000, 10000, 10000, 10000, 10000, 10000];
    // this.times = [1000];
    this.newOptions = ['Stone Block', 'Brick Block', 'Cement Block']
    this.enemyCount = 0;
    this.enemySpawn = 1;
    this.lifeTime = 0;
    this.deathTime = 0;
    this.dead = false;
    this.toLobby = 10000;
  }

  handleDestroy(serverObj){
    // if(serverObj.creatorId != this.game.network.networkData.playerId){

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

  captureDeathTime(){
    this.deathTime = this.lifeTime;
    this.dead = true;
    return this.deathTime;
  }

  update(elapsedTime){
    if(this.dead){
      this.toLobby -= elapsedTime;
      if(this.toLobby <= 0){
        window.location = 'http://localhost:3000';
      }
    }

    this.times[0] && (this.times[0] -= elapsedTime);
    this.lifeTime += elapsedTime;
    if(this.times[0] && this.times[0] < 0){
      this.times.shift();
      this.newOptions.length && this.player.craftingMenu.addOption(this.newOptions.shift());
      if(this.enemyCount > 20) return;
      for(let i = 0; i< this.enemySpawn; i++){
        this.enemyCount += 1;
        // enemy.setTarget(this.player);
        let x = Math.random() > .5 ? 10000 : 0;
        x += _.random(-1000, 1000);
        this.game.network.instantiate({
          name:'enemy',
          transform: {x, y: -100},
          health: 1000
        });
      }
      this.enemySpawn < 10 && (this.enemySpawn ++);
    } else if(!this.times[0]){
      this.times.push(1000);
    }
  }

  handleUpdate(serverObj){
    if(serverObj.creatorId != this.game.network.networkData.playerId){
      this.game.addServerUpdate((elapsedTime) => {
        const otherObject = _.find(this.gameObjects, obj => obj.serverId == serverObj.serverId);
        _.merge(otherObject, serverObj);
      });
    }
  }

  awake(){
    this.game.assets['abyss'].volume = 0.03;
    this.game.assets['abyss'].play();

    this.game.network.on('player updated', (player) => {this.handleUpdate(player)});
    this.game.network.on('player joined', (player) => {
      if(player.creatorId != this.game.network.networkData.playerId){
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
      if(obj.creatorId != this.game.network.networkData.playerId){
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
      if(block.creatorId != this.game.network.networkData.playerId){
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
    this.game.network.on('enemy updated', (enemy) => {this.handleUpdate(enemy)});
    this.game.network.on('enemy destroyed', (enemy) => {this.handleDestroy(enemy)});
    this.game.network.on('enemy instantiated', (enemy) => {
      this.game.addServerUpdate((elapsedTime) => {
        const e = this.instantiate(Enemy, false);
        _.merge(e, enemy);
        if(e.creatorId == this.game.network.networkData.playerId){
          e.setTarget(this.player);
        }
      });
    });

    this.game.network.on('damage enemy', (data) => {
      if(data.creatorId == this.game.network.networkData.playerId){
        const enemy = _.find(this.gameObjects, obj => obj.serverId == data.serverId);
        enemy.addDamage(250);
      }
    });

    this.game.network.on('laser destroyed', (obj)=>{
      this.handleDestroy(obj);
    });
    this.game.network.on('block destroyed', (obj)=>{
      this.handleDestroy(obj);
    });
    this.game.network.on('player died', () => {
      this.captureDeathTime();
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
      if(left && obj.transform.x - obj.width > from.x) continue;
      if(!left && obj.transform.x + obj.width < from.x) continue;
      if(down && obj.transform.y < from.y) continue;
      if(!down && obj.transform.y > from.y) continue;
      if(obj.name == 'block' || obj.name == 'enemy'){

        if(left){
          const y = (((obj.transform.x + (obj.width / 2)) - from.x)*mod) + from.y;
          if(y < obj.transform.y + (obj.height/2) && y > obj.transform.y - (obj.height/2)){
            obj.transform.x < from.x && obj.transform.x > to.x && collisions.push({
              x: obj.transform.x + (obj.width / 2),
              y,
              obj
            });
          }
        } else {
          const y = (((obj.transform.x - (obj.width / 2)) - from.x)*mod) + from.y;
          if(y < obj.transform.y + (obj.height/2) && y > obj.transform.y - (obj.height/2)){

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
            // if(left && down){
            //   console.log("x:",x, from.x);
            //   console.log(y,from.y,to.y,b);
            //   y > from.y && y < to.y && console.log('found');
            // }
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
  render(){
    if(!this.dead) return;
    this.game.graphics.drawText(
      {x: 350, y: 200},
      'Game Over',
      {
        textAlign: 'center',
        font: '30px Roboto',
        fillStyle: 'white'
      }
    );

    this.game.graphics.drawText(
      {x: 350, y: 230},
      `You survived ${Math.trunc(this.deathTime/1000)} seconds`,
      {
        textAlign: 'center',
        font: '30px Roboto',
        fillStyle: 'white'
      }
    );

    this.game.graphics.drawText(
      {x: 350, y: 260},
      `Returning to lobby in ${Math.trunc(this.toLobby/1000)}`,
      {
        textAlign: 'center',
        font: '30px Roboto',
        fillStyle: 'white'
      }
    );
  }
}

function startGame(networkData, keyMap){
  const canvas = document.getElementById('main-canvas');
  canvas.width = 700;
  canvas.height = 500;
  const assets = [
    {type: 'image', src: '/spritesheets/sprites.png', name: 'sprites'},
    {type: 'image', src: '/spritesheets/character.png', name: 'player'},
    {type: 'image', src: '/spritesheets/hillsFront.png', name: 'hillsFront'},
    {type: 'image', src: '/spritesheets/hillsBack.png', name: 'hillsBack'},
    {type: 'image', src: '/spritesheets/enemy.png', name: 'enemy'},
    {type: 'image', src: '/spritesheets/stars_background.png', name: 'starsBackground'},
    {type: 'sound', src: '/sounds/abyss.mp3', name: 'abyss'},
    {type: 'sound', src: '/sounds/twilight.mp3', name: 'twilight'},
    {type: 'sound', src: '/sounds/laser.wav', name: 'laser'},
    {type: 'sound', src: '/sounds/dead_brick.wav', name: 'deadBrick'},
    {type: 'sound', src: '/sounds/enemyExplosion.wav', name: 'enemyExplosion'},
  ];
  const game = new Game(canvas, assets, networkData, keyMap);
  const mainWorld = new MainWorld('mainWorld', game);
  //
  const loadingScene = new LoadingScene('loadingScene', game);
  loadingScene.awake();
  // mainMenu.awake();
  // mainWorld.awake();
  // splashScreen.awake();
  // game.addScene(splashScreen);
  // game.addScene(mainMenu);
  game.addScene(loadingScene);
  game.addScene(mainWorld);
  game.start();
  return game;
};

(function(){
  let data = window.location.search.replace('?', '').split("&");
  let networkData = _.reduce(data,(result, keyVal)=>{
    let parts = _.map(keyVal.split("="), part => decodeURIComponent(part));
    result[parts[0]] = parts[1];
    return result;
  }, {});
  var request = superagent;
  request.get('http://localhost:9000/users?player_id='+networkData.playerId).end((err, res)=>{

    const keyMap = JSON.parse(res.text).keyMap;
    let game = startGame(networkData, keyMap);
  });
})();
