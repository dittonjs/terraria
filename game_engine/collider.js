class Collider {

  _onCollision(other, dir){
    this.onCollision && this.onCollision(other, dir);
  }

  _checkCollision(other){
    if(other === this) {
      this._collider_opts.useWalls && this._checkWallCollision();
      return;
    }
    const {isBetween} = this.game.math;
    const {width:myWidth, height:myHeight} = this._collider_opts;
    const {width:otherWidth, height:otherHeight} = other._collider_opts;
    const {x:myX, y:myY} = this.transform;
    const {x:otherX, y:otherY} = other.transform;
    if( isBetween(otherX - (otherWidth/2), otherX+(otherWidth/2), myX + (myWidth/2)) &&
        (
          isBetween(otherY-(otherHeight/2), otherY+(otherHeight/2), myY - (myHeight/2)) ||
          isBetween(otherY-(otherHeight/2), otherY+(otherHeight/2), myY + (myHeight/2))
        ) && myX < otherX-(otherWidth/2)
      ){
      this._onCollision(other, 'right');
    }
    else if( isBetween(otherX - (otherWidth/2), otherX+(otherWidth/2), myX - (myWidth/2)) &&
        (
          isBetween(otherY-(otherHeight/2), otherY+(otherHeight/2), myY - (myHeight/2)) ||
          isBetween(otherY-(otherHeight/2), otherY+(otherHeight/2), myY + (myHeight/2))
        ) && myX > otherX+(otherWidth/2)
      ){
      this._onCollision(other, 'left');
    }
    // on top

    else if( isBetween(otherY - (otherHeight/2), otherY+(otherHeight/2), myY -(myHeight/2)) &&
        (
          isBetween(otherX-(otherWidth/2), otherX+(otherWidth/2), myX - (myWidth/2)) ||
          isBetween(otherX-(otherWidth/2), otherX+(otherWidth/2), myX + (myWidth/2))
        ) && myY > otherY+(otherHeight/2)
      ){
      this._onCollision(other, 'top');
    }

    // on bottom
    else if( isBetween(otherY - (otherHeight/2), otherY+(otherHeight/2), myY + (myHeight/2)) &&
        (
          isBetween(otherX-(otherWidth/2), otherX+(otherWidth/2), myX - (myWidth/2)) ||
          isBetween(otherX-(otherWidth/2), otherX+(otherWidth/2), myX + (myWidth/2))
        ) && myY < otherY-(otherHeight/2)
      ){
      this._onCollision(other, 'bottom');
    }

  }
  _checkWallCollision(){
    if(this.transform.x - (this._collider_opts.width/2) < 0) this._onCollision({name: 'wall'}, 'left');
    if(this.transform.x + (this._collider_opts.width/2) > this.game.width) this._onCollision({name: 'wall'}, 'right');
    if(this.transform.y - (this._collider_opts.height/2) < 0 ) this._onCollision({name: 'wall'}, 'top');
    if(this.transform.y + (this._collider_opts.height/2) > this.game.height) this._onCollision({name: 'wall'}, 'bottom');
  }
  setColliderType(type, opts = {}){
    this._collider_type = type; // one of 'box' or 'circle'
    this._collider_opts = opts;
  }
}
