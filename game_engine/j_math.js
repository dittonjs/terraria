class JMath {
  sin(degrees){
    return Math.sin(this.degToRad(degrees));
  }

  cos(degrees){
    return Math.cos(this.degToRad(degrees));
  }

  degToRad(deg){
    return deg * (Math.PI/180);
  }

  radToDeg(rad){
    return rad * (180/Math.PI);
  }

  asin(val){
    return radToDeg(Math.asin(val));
  }

  acos(val){
    return radToDeg(Math.acos(val));
  }

  isBetween(lower, upper, target){
    return target >= lower && target <= upper;
  }

  random(top){
    return Math.floor((Math.random() * top));
  }
}
