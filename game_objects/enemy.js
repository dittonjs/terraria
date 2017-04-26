
class EnemyParticle extends Particle {
  constructor(...args){
    super(...args);
    this.transform = new Transform(
      this.parent.transform.x + _.random(-5, 5),
      this.parent.transform.y + _.random(-5, 5)
    );
    this.transform.rotation = (this.transform.x - this.parent.transform.x);
    this.xVelocity = 1 * (this.transform.x - this.parent.transform.x);
    this.yVelocity = 1 * (this.transform.y - this.parent.transform.y);
    this.gravity = 0;
    this.sprite = new JSprite(this.game.assets.sprites, 0, 37 * 32, 6 * 32, 32,32,15,15);
    this.timePlaying = 0;

  }
  update(elapsedTime){
    // this.gravity += (1.5 * 100 * (elapsedTime/1000)*(elapsedTime/1000));
    const modifier = this.xVelocity < 0 ? -1 : 1;
    // this.xVelocity -= Math.abs(this.transform.x - this.parent.transform.x) * modifier;
    this.transform.translate(
      this.xVelocity * (elapsedTime/1000),
      (this.yVelocity * (elapsedTime/1000)) - this.gravity
    );

    this.timePlaying += elapsedTime;
    // console.log(this.opts.lifetime);
    if(this.opts.lifetime && this.timePlaying > this.opts.lifetime){
      this.parent.disable();
      return;
    }
  }
  awake(){
    this.timePlaying = 0;
    this.gravity = 0;
    this.transform = new Transform(
      this.parent.transform.x + _.random(-5, 5),
      this.parent.transform.y + _.random(-5, 5)
    );
    this.xVelocity = 1 * (this.transform.x - this.parent.transform.x);
    this.yVelocity = 1 * (this.transform.y - this.parent.transform.y);
  }
  render(){
    this.game.graphics.drawImg(
      this.transform,
      this.sprite
    );
  }
}

class EnemyParticleEffect extends ParticleEffect {
  constructor(...args){
    super(...args);
    this.transform = new Transform(this.parent.transform.x, this.parent.transform.y);
  }
}

class Enemy extends multiple([Collider]) {
  constructor(...args){
    super(...args);
    this.target = null;
    this.sprite = new JSprite(this.game.assets.enemy, 0,0,0,64,64);
    this.setColliderType(
      'box',
      {
        width: 70,
        height: 70
      }
    );
    this.width = 64;
    this.height = 64;
    this.verticalVelocity = 0;
    this.name = 'enemy';
    this.health = 1000;
    this.particleEffect = null;
    this.timeSinceShot = 2000;
    this.damage = 25;
  }
  setTarget(target){
    this.target = target;
  }
  onDestroy(){
    this.scene.enemyCount--;
  }
  updateAndShoot(deltaTime){

    this.timeSinceShot -= deltaTime;
    if(this.timeSinceShot <= 0) {
      this.timeSinceShot = 2000;
      const raycastHit = this.scene.castRay(
        {x: this.transform.x, y: this.transform.y},
        {x: this.target.transform.x, y: this.target.transform.y}
      );
      if(raycastHit){
        if(raycastHit.obj.name == 'block'){
          raycastHit.obj.health -= this.damage + 25;
          if(raycastHit.obj.health <= 0){
            this.scene.destroy(raycastHit.obj);
            this.game.network.destroy(raycastHit.obj.serverId);
          }
        }



        raycastHit.obj.name == 'enemy' && (raycastHit.obj.addDamage(200, raycastHit));
        const laser = this.scene.instantiate(Laser, false, [raycastHit], this);
        laser.color = 'red';
        laser.creatorId = this.game.network.networkData.playerId;
        this.game.network.instantiate({name: 'laser', to: {x: raycastHit.x, y: raycastHit.y}, from: this.transform});
      } else {
        const laser = this.scene.instantiate(Laser, false, [this.target.transform], this);
        laser.color = 'red';
        laser.creatorId = this.game.network.networkData.playerId;
        this.game.network.instantiate({name: 'laser', to: {x: this.target.transform.x, y: this.target.transform.y}, from: this.transform});
        this.target.addDamage(35);
      }

      this.game.assets.laser.volume = .03;
      this.game.assets.laser.play();
    }
  }
  update(deltaTime){
    if(this.creatorId != this.game.network.networkData.playerId) return;
    if(this.target && !this.scene.dead){
      this.verticalVelocity += 100 * (deltaTime /1000);
      this.verticalVelocity > 0 && (this.verticalVelocity = 0);
      if(Math.abs(this.target.transform.x - this.transform.x) < 200 && Math.abs(this.target.transform.y - this.transform.y) < 200){
        this.updateAndShoot(deltaTime);

      } else {
        if(Math.abs(this.target.transform.x - this.transform.x) < 400 && Math.abs(this.target.transform.y - this.transform.y) < 400){
          this.updateAndShoot(deltaTime);
        }
        this.transform.translate(
          (this.target.transform.x - this.transform.x) * (deltaTime/1000),
          (this.target.transform.y - this.transform.y + this.verticalVelocity) * (deltaTime/1000)
        );
      }
    }
    this.game.network.update(this.serverId, {transform: this.transform, health: this.health});
  }

  addDamage(damage, hit = this.transform){
    this.particleEffect.transform.x = hit.x;
    this.particleEffect.transform.y = hit.y;
    setTimeout(() => {this.game.assets.enemyExplosion.volume = .03; this.game.assets.enemyExplosion.play()});
    this.particleEffect.play();
    if(this.creatorId != this.game.network.networkData.playerId){
      this.game.network.emit('damage enemy', {creatorId: this.creatorId, serverId: this.serverId});
      return;
    }
    this.health -= damage;
    if(this.health < 0){
      this.scene.destroy(this);
      this.game.network.destroy(this.serverId);
    }
  }

  onCollision(other, dir){
    if(other.name == 'player') return;
    if(dir == 'right'){
      this.verticalVelocity -= 10;
      this.transform.x -= 5;
    }
    if(dir == 'left'){
      this.verticalVelocity -= 10;
      this.transform.x += 5;
    }
    if(dir == 'bottom'){
      this.transform.y -= 5;
    }
    if(dir == 'top'){
      this.transform.y += 5;
    }
  }

  awake(){
    const particleEffectOpts = {
      particleCount: 600,
      atATime: 20,
      particleClass: EnemyParticle,
      particleOpts: {
        lifetime: 1000,
        color: this.color
      }
    }
    this.particleEffect = this.scene.instantiate(EnemyParticleEffect, false, [particleEffectOpts], this);
  }

  render(){
    this.game.graphics.drawImg(
      this.transform,
      this.sprite
    );
  }
}
