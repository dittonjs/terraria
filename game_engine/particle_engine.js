class Particle extends GameObject {
  constructor(opts, ...args){
    super(...args);
    this.opts = opts;
  }

  disable(){
    this.parent.readyForDisable.push(this);
  }
}

class ParticleEffect extends GameObject {
  constructor(opts = {}, ...args) {
    super(...args);
    this.opts = opts;
    this.activeParticles = [];
    this.waitingParticles = [];
    this.readyForDisable = [];
    this.playing = false;
    this.spawnTime = 0;
    this.timePlaying = 0;
    this.spawnElapsed = 0;
  }

  awake(){
    this.buildParticles();
  }

  buildParticles(){
    this.waitingParticles = [];
    for(let i = 0; i < this.opts.particleCount; i++){
      this.waitingParticles.push(new this.opts.particleClass(this.opts.particleOpts, this.game, this.scene, this));
    }
  }

  play(){
    if(this.playing) return;
    this.playing = true;
    if(this.opts.allAtOnce){
      this.activeParticles = [...this.waitingParticles];
      this.waitingParticles = [];
      _.each(this.activeParticles, particle => particle.awake());
    } else {
      this.spawnTime = this.opts.spawnTime || (1000 / this.opts.particleCount);
    }
  }

  stop(){
    if(!this.playing) return;
    this.timePlaying = 0;
    this.playing = false;
    this.waitingParticles = [...this.waitingParticles, ...this.activeParticles, ...this.readyForDisable];
    this.readyForDisable = [];
    this.activeParticles = [];
  }

  update(elapsedTime){
    if(!this.playing) return;
    this.timePlaying += elapsedTime;
    this.spawnElapsed += elapsedTime;
    if(this.opts.lifetime && this.timePlaying > this.opts.lifetime){
      this.stop();
      return;
    }
    if (this.opts.allAtOnce) {
      _.each(this.activeParticles, particle => particle.update(elapsedTime));
    } else {
      if(this.spawnElapsed > this.spawnTime){
        this.spawnElapsed = 0;
        if(this.waitingParticles.length){
          const next = this.waitingParticles.shift();
          next.awake();
          this.activeParticles.push(next);
        }
      }
      _.each(this.activeParticles, particle => particle.update(elapsedTime));
    }
    _.each(this.readyForDisable, particle => _.remove(this.activeParticles, particle));
    this.waitingParticles = [...this.waitingParticles, ...this.readyForDisable];
    this.readyForDisable = [];
  }

  render(){
    if(!this.playing) return;
    _.each(this.activeParticles, particle => particle.render());
  }
}
