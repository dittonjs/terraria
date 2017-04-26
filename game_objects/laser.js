class LaserParticle extends Particle {
  constructor(...args){
    super(...args);
    this.transform = new Transform(
      this.parent.transform.x + _.random(-5, 5),
      this.parent.transform.y + _.random(-5, 5)
    );
    this.timePlaying = 0;
    this.gravity = 0;
  }
  update(elapsedTime){
    this.gravity += 9.8 * 100 *((elapsedTime/1000)**2);
    this.yVelocity += this.gravity;
    this.transform.translate(
      this.xVelocity * (elapsedTime/1000),
      this.yVelocity * (elapsedTime/1000)
    );

    this.timePlaying += elapsedTime;
    if(this.opts.lifetime && this.timePlaying > this.opts.lifetime){
      this.parent.disable();
      return;
    }
  }
  awake(){
    this.timePlaying = 0;
    this.transform = new Transform(
      this.parent.transform.x + _.random(-10, 10),
      this.parent.transform.y + _.random(-5, 5)
    );
    this.xVelocity = 20 * ((this.transform.x - this.parent.transform.x));
    this.xVelocity += .6 * (this.parent.to.x - this.parent.transform.x);
    this.yVelocity = 20 * ((this.transform.y - this.parent.transform.y));
    this.yVelocity += .6 *(this.parent.to.y - this.parent.transform.y);
  }

  render(){
    this.game.graphics.drawLine(
      this.transform,
      {x: this.transform.x+_.random(-2,2), y: this.transform.y+_.random(-2,2)},
      {
        lineWidth: 2,
        strokeStyle: 'yellow',
      }
    );
  }
}

class LaserParticleEffect extends ParticleEffect {
  constructor(at, to, ...args){
    super(...args);
    this.transform = at;
    this.to = to;
  }
}



class Laser extends GameObject {
  constructor(to, ...args){
    super(...args);
    this.name = 'laser';
    this.to = to;
    this.duration = 500;
    this.life = 0;
    this.from = {};
    this.color = 'blue';
    this.particleEffect = null;
  }
  awake(){
    const particleEffectOpts = {
      particleCount: 600,
      atATime: 10,
      particleClass: LaserParticle,
      particleOpts: {
        lifetime: 1000,
        color: this.color
      }
    }
    const from = this.parent ? {x: this.parent.transform.x, y: this.parent.transform.y - 15} : this.from;
    this.particleEffect = this.scene.instantiate(LaserParticleEffect, false, [from, this.to, particleEffectOpts], this);
    this.particleEffect.play()
  }
  update(elapsedTime){
    const from = this.parent ? {x: this.parent.transform.x, y: this.parent.transform.y - 15} : this.from;
    this.from = from;
    this.life += elapsedTime;
    // this.game.network.update(
    //   this.serverId,
    //   {to: {x: this.to.x, y:this.to.y}, from: {x: from.x, y: from.y}, life: this.life}
    // );
    if(this.life > this.duration){
      this.parent && (this.parent.shooting = false);
      // this.game.network.destroy(this.serverId);
      this.scene.destroy(this);
      this.scene.destroy(this.particleEffect);
    }
  }

  render(){
    this.game.graphics.drawLine(
      this.from,
      this.to,
      {
        lineWidth: 10 - (10 * this.life / this.duration),
        strokeStyle: this.color
      }
    );
  }

}
