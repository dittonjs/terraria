// 63 x 47
// 32px

class CraftingMenuOption extends multiple([Clickable]) {
  constructor(text, isSelected, ...args){
    super(...args);
    this.text = text;
    this.isSelected = !!isSelected;
    this.width = 50;
    this.height = 20;

  }

  update(){
    const click = this.wasClicked();
    if(click){
      this.scene.selectItem(this);
    }
  }
  render(){
    this.game.graphics.drawText(
      this.transform,
      this.text,
      {
        textAlign: 'center',
        font: '15px Roboto',
        fillStyle: this.isSelected? '#4CAF50' : 'white'
      }
    )
  }
}

class CraftingMenu extends GameScene {
  constructor(player, ...args){
    super(...args);
    this.options = [
      'Mining Laser',
      'Dirt',
      'Stone wall',
      'Brick wall',
      'Cement wall',
      'Wood Wall',
      'Wood Door',
      'Glass window',
      'Fireplace',
      'SAVE GAME'
    ]
    this.player = player
    this.open = false;
    this.currentSelection = 'Mining Laser'
  }

  toggleMenu(open){
    this.open = open;
  }
  selectItem(item){
    if(item.text == 'SAVE GAME'){
      this.game.network.emit('save game', this.game.network.networkData.gameName);
      this.open = false;
      return;
    }
    _.each(this.gameObjects, obj=>{obj.isSelected = false});
    item.isSelected = true;
    this.currentSelection = item.text;
  }
  awake(){
    _.each(this.options, (option, i)=>{
      const opt = this.instantiate(CraftingMenuOption, false, [option, i == 0], this);
      opt.transform = new Transform(100, 100 + (20* i));
    });
  }

  update(){
    if(!this.open) return;
    _.each(this.gameObjects, (obj)=>{
      obj.update();
    });
  }

  render(){
    this.game.graphics.drawText(
      {x: 100, y: 20},
      "Current Tool: " + this.currentSelection,
      {
        textAlign: 'center',
        font: '15px Roboto',
        fillStyle: this.isSelected? '#4CAF50' : 'white'
      }
    )
    if(!this.open) return;
    _.each(this.gameObjects, (obj)=>{
      obj.render();
    });
  }
}
