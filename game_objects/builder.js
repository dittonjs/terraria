class Builder extends GameObject {
  constructor(...args){
    super(...args);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.game.canvas.addEventListener('mousemove', this.onMouseMove);
    this.cursorPosition = {x: -10000, y: -10000}
    this.sprite = new JSprite(this.game.assets.sprites, 0, 8*32, 0);
    this.negativeSprite = new JSprite(this.game.assets.sprites, 0, 0, 1*32);

  }
  onMouseMove(e){
    e.preventDefault();
    if(this.parent.craftingMenu.currentSelection != 'Mining Laser'){
      let x = e.clientX - e.target.offsetLeft;
      this.scene.camera && (x += this.scene.camera.transform.x);
      let y = e.clientY - e.target.offsetTop;
      this.scene.camera && (y += this.scene.camera.transform.y);
      this.cursorPosition = {x,y};
    }
  }
  normalize(transform){
    const x = (Math.ceil(transform.x / 32.0) * 32) - 32 + 16;
    const y = (Math.ceil(transform.y / 32.0) * 32);
    return {x,y};
  }
  checkSquare(position = this.cursorPosition){
    const mover = _.find(this.scene.gameObjects, (obj)=>{
      const {x:objX, y:objY} = this.normalize(obj.transform);
      const {x:mouseX, y:mouseY} = this.normalize({x:position.x, y: position.y});
      return objX == mouseX && objY == mouseY;
    });
    if(mover){
      return true;
    }

    return !!_.find(this.scene.staticGameObjects, (obj)=>{
      const {x, y} = this.normalize({x:position.x, y: position.y});
      return x == obj.transform.x && y == obj.transform.y;
    });
  }
  render(){
    if(this.parent.craftingMenu.currentSelection == 'Mining Laser' || this.parent.craftingMenu.open) return;
    const {x, y} = this.normalize({x:this.cursorPosition.x, y: this.cursorPosition.y});
    const isOccupied = this.checkSquare();
    if(isOccupied){
      this.game.graphics.drawImg(
        {x,y},
        this.negativeSprite
      );
    } else {
      this.game.graphics.drawImg(
        {x,y},
        this.sprite
      );
    }

  }
}
