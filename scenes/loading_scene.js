class LoadingScene extends GameScene {
  constructor(...args){
    super(...args);
    this.transitionTime = null;
    this.readyForTransition = 0;
    this.path = 'new game';
    this.data = {
      name: 'hello world'
    };
    this.text = "Building environment...";
    this.blocksCreated = false;
    this.enemiesSpawned = false;
    this.playerReady = false;
    this.gameReady = false;
  }

  setPath(path, data){
    this.path = path;
  }
  checkAndTransition(){
    this.blocksCreated && this.gameReady && this.enemiesSpawned && this.playerReady && this.game.changeScene(3);
  }
  blockFromType(type){
    switch (type) {
      case 'grass':
        return GrassBlock;
        break;
      case 'dirt':
        return DirtBlock;
      default:

    }
  }
  awake(){
    this.game.network.on('blocks created', (data)=>{
      // build the game here
      const mainGame = this.game.scenes[3];
      _.each(data, (block)=>{
        const newBlock = mainGame.instantiate(this.blockFromType(block.type), true, [{x:0,y:0}]);
        _.merge(newBlock, block);
      });
      this.blocksCreated = true;
      this.checkAndTransition()
      this.text = "Spawning enemies..."
    });

    this.game.network.on('enemies spawned', ()=>{
      // create enemies
      this.enemiesSpawned = true;
      this.checkAndTransition();
      this.text = "Creating players..."
    });

    this.game.network.on('players ready', (players)=>{
      //create players
      const mainGame = this.game.scenes[3];
      _.each(players, (player, index)=>{
        const newPlayer = mainGame.instantiate(Player, false);
        _.merge(newPlayer, player);
        if(index == 0){
          mainGame.player = newPlayer;
        }
      });
      this.playerReady = true;
      this.checkAndTransition();
    });

    this.game.network.on('server ready', (name)=>{
      this.gameReady = true;
      this.game.scenes[3].gameName = name;
      this.checkAndTransition();
    });
    this.game.network.on('game joined', (data)=>{
      const mainGame = this.game.scenes[3];
      this.game.scenes[3].gameName = this.data.name;
      _.each(data.gameObjects, (obj)=>{
        if(obj.name == 'player'){
          const player = mainGame.instantiate(Player, false);
          _.merge(player, obj);
          if(player.creatorId == this.game.network.playerId){
            mainGame.player = player;
          } else {
            player.setConditionMap({
              idle: ()=>(true),
              walk: ()=>(player.conditions.walk),
              run: ()=>(player.conditions.run),
              jump: ()=>(player.conditions.jump),
            });
          }
        }
        if(obj.name == 'block'){
          _.merge(mainGame.instantiate(this.blockFromType(obj.type), true, [{x:0, y:0}]), obj);
        }
      });
      this.game.changeScene(3);
    });
    this.game.network.emit(this.path, this.data);
  }

  render(){
    this.game.graphics.drawText(
      {x: this.game.width/2, y:this.game.height/2 - 100},
      this.text,
      {
        textAlign: 'center',
        font: '50px Roboto',
        fillStyle: 'white'
      }
    )
  }
}
