class AnimationMachine {
  addAnimation(animation, name){
    if(!this._animations) this._animations = {};
    if(!this._currentAnimation) this._currentAnimation = null;
    if(!this._timeSinceSwitch) this._timeSinceSwitch = 0;
    if(!this._conditionMap) this._conditionMap = 0;
    this._animations[name] = animation;
  }

  setCurrentAnimation(name){
    this._currentAnimation && (this._currentAnimation.animationIndex = 0);
    this._currentAnimation = this._animations[name];
    this.sprite = this._currentAnimation.sprites[0];
    this._timeSinceSwitch = 0;
  }

  // a hash of functions
  setConditionMap(map){
    this._conditionMap = map;
  }

  _checkConditionMap(){
    let newAnimation = null;
    const conditions = {};
    _.each(this._conditionMap, (conditionCheck, key)=>{
      const cond = conditionCheck()
      if(cond){
        newAnimation = key;
      }
      conditions[key] = cond
    });
    if(newAnimation && this._currentAnimation != this._animations[newAnimation]){
      this.setCurrentAnimation(newAnimation);
    }
    return conditions;
  }

  updateAnimations(elapsedTime){
    const conditions = this._checkConditionMap();
    this._timeSinceSwitch += elapsedTime;
    if(this._timeSinceSwitch > this._currentAnimation.frameDuration){
      this._timeSinceSwitch = 0;
      if(this._currentAnimation.animationIndex == this._currentAnimation.sprites.length - 1 ){
        if(this._currentAnimation.repeat){
          this._currentAnimation.animationIndex = 0;
          this.sprite = this._currentAnimation.sprites[this._currentAnimation.animationIndex];
        }
      } else {
        this._currentAnimation.animationIndex += 1;
        this.sprite = this._currentAnimation.sprites[this._currentAnimation.animationIndex];
      }
    }
    return conditions;
  }

}

class Animation {
  constructor(sprites, frameDuration, repeat = true){
    this.sprites = sprites;
    this.frameDuration = frameDuration;
    this.repeat = repeat;
    this.animationIndex = 0;
  }
}

class JSprite {
  constructor(img, sheetWidth, sourceX = 0, sourceY = 0, sourceWidth = 32, sourceHeight = 32, dWidth = sourceWidth, dHeight = sourceHeight){
    this.img = img;
    this.sourceX = sourceX;
    this.sourceY = sourceY;
    this.sourceWidth = sourceWidth;
    this.sourceHeight = sourceHeight;
    this.dWidth = dWidth;
    this.dHeight = dHeight;
    this.sheetWidth = sheetWidth;
  }
}
