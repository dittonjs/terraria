class Transform {
  constructor(x, y, rotation){
    this.x = x;
    this.y = y;
    this.rotation = rotation;
  }

  rotate(rotation){
    this.rotation += rotation;
  }

  translate(x, y){
    this.x += x;
    this.y += y;
  }
}

class Vector {
  constructor(x, y){
    // normal vector less than 1 corresponds to sin and cos functions.
    this.x = x;
    this.y = y;
  }

}
