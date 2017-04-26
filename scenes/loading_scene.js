class LoadingScene extends GameScene {
  constructor(...args){
    super(...args);
    this.transitionTime = null;
    this.readyForTransition = 0;
    this.text = "Building environment...";
  }

  transition(){
    this.game.changeScene(1);
  }

  blockFromType(type){
    switch (type) {
      case 'grass':
        return GrassBlock;
        break;
      case 'dirt':
      case 'Dirt':
        return DirtBlock;
      default:

    }
  }
  awake(){
    this.game.network.on('game loaded', (data) => {
      async function createObjects(){
        const mainGame = this.game.scenes[1];
        _.each(data.blocks, (block)=>{
          const newBlock = mainGame.instantiate(this.blockFromType(block.type), true, [{x:0,y:0}]);
          _.merge(newBlock, block);
        });

        _.each(data.players, (player, index)=>{
          const newPlayer = mainGame.instantiate(Player, false);
          _.merge(newPlayer, player);
          if(newPlayer.creatorId == this.game.network.networkData.playerId){
            console.log(newPlayer);
            mainGame.player = newPlayer;
            mainGame.player.transform.y -= 10;
          }
        });
      }
      createObjects.call(this).then(() => this.transition());
    });

    this.game.network.on('game joined', (data) => {
      const mainGame = this.game.scenes[1];
      _.each(data.gameObjects, (obj) => {
        if(obj.name == 'block'){
          const newBlock = mainGame.instantiate(this.blockFromType(obj.type), true, [{x:0,y:0}]);
          _.merge(newBlock, obj);
        }
        if(obj.name == 'player'){
          const newPlayer = mainGame.instantiate(Player, false);
          _.merge(newPlayer, obj);
          if(newPlayer.creatorId == this.game.network.networkData.playerId){
            mainGame.player = newPlayer;
          } else {
            newPlayer.setConditionMap({
              idle: ()=>(true),
              walk: ()=>(newPlayer.conditions.walk),
              run: ()=>(newPlayer.conditions.run),
              jump: ()=>(newPlayer.conditions.jump),
            });
          }
        }
      });
      this.transition();
    });

    const path = this.game.network.networkData.join == 'false' ? 'continue game' : 'join game';
    this.game.network.emit(path, {name: this.game.network.networkData.gameName, playerId: this.game.network.networkData.playerId});
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
