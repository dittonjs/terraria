class MenuOption extends GameObject {
  constructor(text, selectable, ...args){
    super(...args);
    this.text = text;
    this._onClick = () => {};
    this.isFocused = false;
    this.focusedColor = "#4CAF50";
    this.standardColor = "white";
    this.disabledColor = "lightgrey";
    this.selectable = selectable;
  }

  onClick(callback){
    this._onClick = callback;
  }

  update(){
    _.each(this.game.readyInput, input => {
      if(input.key == 'confirm' && this.isFocused){
        this._onClick(this);
      }
    });
  }

  render(){
    const color = !this.selectable ? this.disabledColor : this.standardColor
    this.game.graphics.drawText(
      this.transform,
      this.text,
      {
        textAlign: 'center',
        font: '50px Roboto',
        fillStyle: this.isFocused ? this.focusedColor : color
      }
    )
  }
}
