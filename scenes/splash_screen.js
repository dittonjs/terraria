class SplashScreen extends GameScene {
  constructor(...args){
    super(...args);
    this.transitionTime = null;
    this.readyForTransition = 0;
    this.worldNamesLoaded = false;
    this.liveGamesLoaded = false;
  }
  awake(){
    this.game.network.on('world names loaded', (data)=>{
      dataStore.worldNames = data;
      this.transitionTime = 2000;
    });
    this.game.network.on('live games loaded', (data)=>{
      dataStore.liveGames = data;
      dataStore.liveGamesLoaded = true;
      this.worldNamesLoaded && this.liveGamesLoaded && (this.transitionTime = 2000);
    });
    this.game.network.emit('game started');
  }
  update(elapsedTime){
    if(this.transitionTime != null){
      this.readyForTransition += elapsedTime;
      if(this.readyForTransition > this.transitionTime){
        this.game.changeScene(1);
      }
    }
  }
  render(){
    this.game.graphics.drawText(
      {x: this.game.width/2, y:this.game.height/2 - 100},
      "TERRARIA",
      {
        textAlign: 'center',
        font: '100px Roboto',
        fillStyle: 'white'
      }
    )
  }
}
