class Clickable {
  wasClicked(){
    return _.find(this.game.readyInput, (input)=>{
      if(input.key == 'click'){
        if(input.screenSpace.x < this.transform.x + (this.width/2) &&
          input.screenSpace.x > this.transform.x - (this.width/2) &&
          input.screenSpace.y < this.transform.y + (this.height/2) &&
          input.screenSpace.y > this.transform.y - (this.height/2))
          return true;
      }
      return false;
    });
  }
}
