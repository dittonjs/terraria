class MainMenu extends GameScene {
  constructor(...args){
    super(...args);
    this.menuOptions = [];
    this.currentOption = null;
    this.currentOptionIndex = null;
    this.joinOption = null;
    this.gamesReady = [];
  }

  awake(){
    this.game.network.on('game ready', (gameName)=>{
      dataStore.liveGames.push(gameName);
      this.joinOption.selectable = true;
    });
    _.each(["CONTINUE", "JOIN", "NEW GAME"], (text, index) => {
      let selectable = true;
      if(text == 'CONTINUE' && dataStore.worldNames.length == 0) selectable = false;
      if(text == 'JOIN'){
        selectable = !!dataStore.liveGames.length;
      }
      const option = this.instantiate(MenuOption, false, [text, selectable]);
      text == "JOIN" && (this.joinOption = option);
      option.transform.x = this.game.width/2;
      option.transform.y = 200 + (index * 80);
      option.onClick(()=>{
        if(text == "NEW GAME"){
          this.game.scenes[2].setPath('new game', {name: 'hello world'});
          this.game.changeScene(2);
        }
        if(text == "JOIN"){
          this.game.scenes[2].setPath('join game', {name: 'hello world'});
          this.game.changeScene(2);
        }
      });
      this.menuOptions.push(option);
      !this.currentOptionIndex && option.selectable && (this.currentOptionIndex = index)
    });
    this.currentOption = this.menuOptions[this.currentOptionIndex];
    this.currentOption.isFocused = true;
  }

  update(){
    _.each(this.game.readyInput, input => {
      if(input.key == 'up' && this.currentOptionIndex > 0 && this.menuOptions[this.currentOptionIndex - 1].selectable){
        console.log("up")
        this.currentOptionIndex -= 1;
        this.currentOption.isFocused = false;
        this.currentOption = this.menuOptions[this.currentOptionIndex];
        this.currentOption.isFocused = true;
      }
      if(input.key == 'down' && this.currentOptionIndex < this.menuOptions.length - 1 && this.menuOptions[this.currentOptionIndex + 1].selectable){
        console.log("down");
        this.currentOptionIndex += 1;
        this.currentOption.isFocused = false;
        this.currentOption = this.menuOptions[this.currentOptionIndex];
        this.currentOption.isFocused = true;
      }
    });
  }

  render(){
    if(this.waitingForOthers){
      _.each(this.game.playerIds,(id, index)=>{
        this.game.graphics.drawText(
          {x: this.game.width / 2, y:200},
          "Waiting for other players",
          {
            textAlign: 'center',
            font: '40px Roboto',
            fillStyle: 'white'
          }
        )
      });
    }
    _.each(this.game.network.playerIds,(id, index)=>{
      this.game.graphics.drawText(
        {x: 150, y:25 + index * 25},
        id,
        {
          textAlign: 'center',
          font: '20px Roboto',
          fillStyle: 'white'
        }
      )
    });
  }
}
