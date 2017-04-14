class GroundChecker extends multiple([Collider]) {
  constructor(...args){
    super(...args);
    this.setColliderType(
      'box',
      {
        width: 15,
        height: 5
      }
    );
    this.isOnGround = true;
  }

  _update(){
    this.transform.y = this.parent.transform.y + 34;
    this.transform.x = this.parent.transform.x;
    this.isOnGround = false;
  }

  _checkCollision(other){
    if(other == this.parent || other == this || this.isOnGround) return;
    const {isBetween} = this.game.math;
    const {width:myWidth, height:myHeight} = this._collider_opts;
    const {width:otherWidth, height:otherHeight} = other._collider_opts;
    const {x:myX, y:myY} = this.transform;
    const {x:otherX, y:otherY} = other.transform;
    if(
      ( isBetween(otherX - (otherWidth / 2), otherX + (otherWidth / 2), myX + (myWidth / 2) ) ||
      isBetween(otherX - (otherWidth / 2), otherX + (otherWidth / 2), myX - (myWidth / 2)) ) &&
      isBetween(otherY - (otherHeight / 2), otherY + (otherHeight / 2), myY + (myHeight / 2))
    ) {
      this.isOnGround = true;
    }
  }
}
